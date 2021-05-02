# LeechServe.js
This library lets you use flickr or any other image hosting service to serve static pages.<br/> Max filesize flickr allows is 200MB per image, most computers will crash at 15.

Demos:<br/>
(400KB | img:600KB)[copy of Dexter's Wiki page (Flickr used for serving the image)](https://gogorikidze.github.io/leechserve/examples/Dexter?serveFrom=flickr)<br/>
(400KB | img:600KB)[copy of Dexter's Wiki page (imgBB used for serving the image)](https://gogorikidze.github.io/leechserve/examples/Dexter?serveFrom=imgBB)<br/>
(1900KB | img:4300KB)["The Mystery of the Immaculate Concussion" by Julia Ioffe (Flickr used for serving the image)](https://gogorikidze.github.io/leechserve/examples/The_Mystery_of_the_Immaculate_Concussion)<br/>
(6400KB | img:12700KB)["The Secrets of the World's Greatest Jailbreak Artist" by Adam Leith Gollner (Flickr used for serving the image)](https://gogorikidze.github.io/leechserve/examples/The_Secrets_of_the_World's_Greatest_Jailbreak_Artist)<br/>


# How to use it
1: Convert your page to a single file with this tool:<br/>
[Singlefile's github repo](https://github.com/gildas-lormeau/SingleFile)<br/>
2: Go to the link below ('compiler.html' you can use your own copy of the file)<br/>
[Encoder](https://gogorikidze.github.io/leechserve/compiler)<br/> (please use Chrome)
3: Choose your HTML file, wait for the image to appear and then download it<br/>
4: Upload the image (flickr and imgBB are preferred as they won't compress the images)<br/>
5: Add LeechServe to you page:<br/>
```html
<script src="leechserve.js"></script>
```
6: Add the image url to your website:
```js
let leech = new Leech({visible: true, threads: false});
leech.loadFromUrl(url); //insert the url of the image
```
