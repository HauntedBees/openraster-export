import * as fs from 'fs';
import * as StreamZip from 'node-stream-zip';
import * as parser from 'fast-xml-parser';
import * as mergeImages from 'merge-images';
import { Canvas, Image } from 'canvas';

export interface ORAOptions {
    excludeHidden?:boolean;
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
    $selected?:boolean;
    //$composite-op?:string;
}
export interface ORAStack {
    layer:ORALayer[];
    $opacity:number;
    $visibility:string;
    //$composite-op:string;
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
    offsetX:number;
    offsetY:number;
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
                    offsetX: layers[i].$x || 0,
                    offsetY: layers[i].$y || 0
                });
            }
        } else {
            const matchDirect = options.excludeLayers && options.excludeLayers.indexOf(name) >= 0;
            const matchRegex = options.excludeRegex && options.excludeRegex.test(name);
            if(!matchRegex && !matchDirect) {
                const buffer = await zip.entryData(layers[i].$src);
                layerBuffers.push({
                    src: buffer,
                    offsetX: layers[i].$x || 0,
                    offsetY: layers[i].$y || 0
                });
            }
        }
    }
    if(options.mergeImageOptions) {
        if(!options.mergeImageOptions.Canvas) { options.mergeImageOptions.Canvas = Canvas; }
        if(!options.mergeImageOptions.Image) { options.mergeImageOptions.Image = Image; }
    } else {
        options.mergeImageOptions = {
            Canvas: Canvas,
            Image: Image
        }
    }
    return mergeImages(layerBuffers, options.mergeImageOptions);
};
export default OpenRasterExport;