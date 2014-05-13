#Similitude

###Controlled, consistent widget, form and image appearance across all DPIs.
#### Distributed under the Apache2 License
*send inquiries to Nathan Ross, <nrossit2@gmail.com>*

With responsive web-and-app design rapidly replacing adaptive design, and with dpi in hardware rapidly increasing, the pressure is on for apps that can look *smooth* and *consistent* at any dpi. This is currently only truly possible through browser transforms; but can only be achieved with much difficulty. 

Similitude is a library designed to abstract that difficulty from you or your developers. Get the same look for your images, styling, and widgets on all devices without having to reinvent the wheel.

### DPR: an incomplete solution.

A common solutions to this is device pixel ratios that previously these allowed web designers to design to a common width, making certain assumptions as to what they could trust the device to interpret for them. 

But as the total catalog and diversity of devices on the market increases keeping track of devices and assumptions that can be made about safe widths becomes, beyond costly, completely impractical. Moreover, it is impossible to control *how* these devices scale. 

What's worse, relying on DPR compromises your ability to give your app a *consistent appearance*, as designers and developers have little control past viewport rules as to scale. What looks good on a device emulator may, on the actual device, scale up in a blocky and patched manner.

### Browser Transforms: The way forward

Holding much more promise for designer control than device-specific graphic-layer scaling is CSS transforms set through javascript. These allow a designer to adapt to a huge variety of DPIs, while allowing the app to understand exactly how much it's being scaled, and allowing widgets to be smoothed at the pixel level in response.

There are several barriers, some on the browser engine level, that yet exist to widespread transform adoption.
* **Browser bugs**: Some widgets or browser forms or styling which can be relied on at (scale: 1) "break" in larger browsers. (E.g. dropdown in firefox)
* **Browser incompatibility**: scaling presents certain inescapable ambiguities as to rendering. Different browser engines have made different design decisions on how to render particular styling at scale, and for some styling these different decisions can result in highly visible visual blotches, imbalances or inconsistency (e.g. borders and hairlines).
* **SVG rendering inconsistencies**: Even with DPR, images are a constant frustration for those scaling for high DPI. The inevitable solution for higher resolutions is SVG, but consider that on firefox, an inline SVG or ```<img>``` svg will not render as sharply as scale as a background-image SVG. On IE, it's the opposite: Widgets must be included inline because at higher scales background-image SVGs become completely fuzzy. This is the beginning of a dozen complications with SVG that only emerge in the context of browser transforms.

Similitude aims to smooth over much of this pain and make transitioning to transforms an easy experience. Already Similitude features:

1. **Widgets designed for predictable, visually-pleasing use with scale transforms**. If you're designing or redesigning your app or website to respond to a high DPI, Similitude provides a set of widgets that can simply be dropped in and just work. Lightweight and easy to use, even borders and consistent positioning. 
   * dropdown menu
   * checkbox
   * togglebutton
   * pushbutton
   * tabs (regular and expanded)
2. **Library tools designed to abstract away any complications with SVG scaling or scale-sensitive styling**:
   * make small pixel widths, lengths, and distances render smoothly with the LineHelperTool
   * add SVGs from any source (as element or as string) and have them be rendered in all browsers correctly and easily.
   * cache SVGs (cacheing is customizable to four levels) as you add them so translation for different browsers is only done once.


## Demonstration

 A "widget museum" website is forthcoming with example code. In the meantime, you can see many of these widgets and tools in action at the TriFold ConfigDemo website (the source of this demo provided here).

## What Does the Name Mean?

The name "Similitude" is an engineering term for "having the same functional characteristics at a different scale"
