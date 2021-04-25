# LeechServe.js
This library lets you use flickr or any other image hosting service to serve static pages. Max filesize flickr allows is 200MB per image, most computers will crash at 15.

Demo:
[copy of Dexter's Wiki page (Flickr used for serving the image)](https://gogorikidze.github.io/leechserve/Dexter?serveFrom=flickr)
[copy of Dexter's Wiki page (imgBB used for serving the image)](https://gogorikidze.github.io/leechserve/Dexter?serveFrom=imgBB)

#How to use it
1: convert your page to a single file with this tool:
[Singlefile's github repo](https://github.com/gildas-lormeau/SingleFile)
2: go to the link below ('compiler.html' if you clone the repo you can use your copy of the file too)
[copy of Dexter's Wiki page (Flickr used for serving the image)](https://gogorikidze.github.io/leechserve/compiler)
3: Choose your HTML file, wait for the image and then download it
4: upload the image to any image hosting service (flickr and imgBB are preferred as they do not compress the images)
5: add LeechServe to you page:
```html
<script src="leechserve.js"></script>
```
6: Add the image link to your website:
```js
let leech = new Leech({visible: true, threads: false});
leech.loadFromUrl(url); //insert the url of the image
```
