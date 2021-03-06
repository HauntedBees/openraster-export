import * as fs from 'fs';
import * as StreamZip from 'node-stream-zip';
import * as parser from 'fast-xml-parser';
import * as mergeImages from 'merge-images';
import { Canvas, Image } from 'canvas';

export interface ORAOptions {
    excludeHidden?:boolean;
    shrink?:boolean;
    excludeLayers?:string[];
    includeLayers?:string[];
    excludeRegex?:RegExp;
    includeRegex?:RegExp;
    mergeImageOptions?:mergeImages.Options;
}

export interface ORALayer {
    $src:string;
    $name?:string;
    $x?:number;
    $y?:number;
    $opacity?:number;
    $visibility?:string;
    "$composite-op?":string;
}
export interface ORAStack {
    layer:ORALayer[];
    $opacity:number;
    $visibility:string;
    "$composite-op":string;
    $isolation:string;
    $name:string;
    $x:number;
    $y:number;
}
export interface ORAImage {
    stack:ORAStack;
    $version:string;
    $w:number;
    $h:number;
    $xres?:number;
    $yres?:number;
}
export interface ORAFile { image:ORAImage }

interface MergeInfo {
    src:Buffer;
    x:number;
    y:number;
}
export const OpenRasterExport = async function(filepath:string, options:ORAOptions):Promise<string> {
    if(!fs.existsSync(filepath)) { throw new Error(`File ${filepath} does not exist.`); }
    const zip = new StreamZip.async({ file: filepath });
    const xmlBuffer = await zip.entryData("stack.xml");
    const imgInfo:ORAFile = parser.parse(xmlBuffer.toString(), { ignoreAttributes: false, attributeNamePrefix: "$", parseAttributeValue: true });
    const layers = imgInfo.image.stack.layer;
    const layerBuffers:MergeInfo[] = [];
    for(let i = (layers.length - 1); i >= 0; i--) {
        const name = layers[i].$name || "";
        if(options.excludeHidden && layers[i].$visibility === "hidden") { continue; }
        if(options.includeLayers || options.includeRegex) {
            const matchDirect = options.includeLayers && options.includeLayers.indexOf(name) >= 0;
            const matchRegex = options.includeRegex && options.includeRegex.test(name);
            if(matchRegex || matchDirect) {
                const buffer = await zip.entryData(layers[i].$src);
                layerBuffers.push({
                    src: buffer,
                    x: layers[i].$x || 0,
                    y: layers[i].$y || 0
                });
            }
        } else {
            const matchDirect = options.excludeLayers && options.excludeLayers.indexOf(name) >= 0;
            const matchRegex = options.excludeRegex && options.excludeRegex.test(name);
            if(!matchRegex && !matchDirect) {
                const buffer = await zip.entryData(layers[i].$src);
                layerBuffers.push({
                    src: buffer,
                    x: layers[i].$x || 0,
                    y: layers[i].$y || 0
                });
            }
        }
    }
    if(options.shrink) {
        let lowestX = -1, lowestY = -1;
        layerBuffers.forEach(l => {
            if(lowestX < 0 || l.x < lowestX) { lowestX = l.x; }
            if(lowestY < 0 || l.y < lowestY) { lowestY = l.y; }
        });
        layerBuffers.forEach(l => {
            l.x -= lowestX;
            l.y -= lowestY;
        });
    }
    if(options.mergeImageOptions) {
        if(!options.mergeImageOptions.Canvas) { options.mergeImageOptions.Canvas = Canvas; }
        if(!options.mergeImageOptions.Image) { options.mergeImageOptions.Image = Image; }
        if(!options.shrink && !options.mergeImageOptions.width) { options.mergeImageOptions.width = imgInfo.image.$w; }
        if(!options.shrink && !options.mergeImageOptions.height) { options.mergeImageOptions.height = imgInfo.image.$h; }
    } else {
        options.mergeImageOptions = {
            Canvas: Canvas,
            Image: Image
        }
        if(!options.shrink) {
            options.mergeImageOptions.width = imgInfo.image.$w;
            options.mergeImageOptions.height = imgInfo.image.$h;
        }
    }
    if(!layerBuffers.length) { return ""; }
    return mergeImages(layerBuffers, options.mergeImageOptions);
};
export default OpenRasterExport;