# OpenRaster Export

This will flatten an ORA file into a single image file, with the ability to limit the layers included in the output.

## Install

```shell
npm install openraster-export
```

## Usage

```js
const OpenRasterExport = require("openraster-export").default;
OpenRasterExport("C:/path/to/file.ora", {
    includeLayers: ["layer1", "layer2"]
}).then(b64 => ...);
```

## Supported Functionality

Currently only one root level `stack` is supported. This stack may have any number of layers, but any sub-stacks will not be included.

On the `image` element, the `w` and `h` attributes are used for your final image resolution, unless you pass the `shrink` option described below. `xres` and `yres` are unused.

On the root-level `stack`, only the `layer` array is used.

On the `layer` elements, the `name` attribute is compared against any of the include/exclude layer rules described below. The `x` and `y` attributes are used for positioning the layer. `visibility` is only considered if the `excludeHidden` option is passed - by default all layers that meet the include/exclude rules (or all layers, if no rules are given) will be included in the exported image. The `opacity` and `composite-op` attributes are currently unused, and all layers will be merged with an opacity of 1 and the default composite operator of `svg:src-over`.

## API

### OpenRasterExport(imagepath, [options])

Returns a Promise which resolves to a base64 data URI

#### imagepath

Type: `string`

Path to the ORA file you want to convert to a single image.

#### options

Type: `option`

You can use either `includeLayers` and/or `includeRegex`, or you can use either `excludeLayers` and/or `excludeRegex`, but you cannot mix includes and excludes. If set, `excludeHidden` will take priority over any `includeLayers`/`includeRegex` rules.

**Gamer Pro-Tip:** Do not use the `g` flag on RegExps passed to `includeRegex` or `excludeRegex` (use `/^something$/`, not `/^something$/g`) or things will fail in weird ways. [I promise it's not my fault.](https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time)

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

##### options.shrink

Type: `boolean`
Default: `false`

If true, the resulting image will be the smallest size that fits all layers, instead of the size of the ORA canvas.

##### options.mergeImageOptions

Type: `mergeImages.Options`
Default: `undefined`

[merge-image Options](https://github.com/lukechilds/merge-images#api). If you specify `Canvas` and `Image` options, your specified values will be used, otherwise a Canvas and Image will be provided.


## Contributing

Sure.

## License

Code is licensed under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.en.html). I am not a lawyer, but what I *intend* for that to mean is, if you use this to generate images locally or as a dev dependency for something, have fun. If you use it as a standard dependency for your project and its code is included in your app/package/whatever, then you must distribute your work under an AGPL-compatible license.