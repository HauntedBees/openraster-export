# OpenRaster Export

This will flatten an ORA file into a single image file, with the ability to limit the layers included in the output.

## Install

```shell
npm install openraster-export
```

## Usage

```js
const OpenRasterExport = require("openraster-export").OpenRasterExport;
OpenRasterExport("C:/path/to/file.ora", {
    includeLayers: ["layer1", "layer2"]
}).then(b64 => ...);
```

## API

### OpenRasterExport(imagepath, [options])

Returns a Promise which resolves to a base64 data URI

#### imagepath

Type: `string`

Path to an ORA file. Currently only ORA files with one `stack` and any number of layers is supported.

#### options

Type: `option`

You can use either `includeLayers` and/or `includeRegex`, or you can use either `excludeLayers` and/or `excludeRegex`, but you cannot mix includes and excludes. If set, `excludeHidden` will take priority over any `includeLayers`/`includeRegex` rules.

#### options.excludeHidden

Type: `boolean`
Default: `false`

If true, all hidden layers (`layer visibility='hidden'`) will be excluded from the exported image.

##### options.includeLayers

Type: `string[]`
Default: `undefined`

List of layers - by name - to include in the exported image. Case sensitive.

##### options.includeRegex

Type: `RegExp`
Default: `undefined`

A regular expression that, if a layer name matches, will include that layer in the exported image.

##### options.excludeLayers

Type: `string[]`
Default: `undefined`

List of layers - by name - to exclude from the exported image. Case sensitive.

##### options.excludeRegex

Type: `RegExp`
Default: `undefined`

A regular expression that, if a layer name matches, will exclude from layer in the exported image.

##### options.mergeImageOptions

Type: `mergeImages.Options`
Default: `undefined`

[merge-image Options](https://github.com/lukechilds/merge-images#api). If you specify `Canvas` and `Image` options, your specified values will be used, otherwise a Canvas and Image will be provided.


## Contributing

Sure.

## License

Code is licensed under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.en.html). I am not a lawyer, but what I *intend* for that to mean is, if you use this to generate images locally or as a dev dependency for something, have fun. If you use it as a standard dependency for your project and its code is included in your app/package/whatever, then you must distribute your work under an AGPL-compatible license.