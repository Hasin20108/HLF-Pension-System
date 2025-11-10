// script.js
function changeFavicon(color) {
    const link = document.querySelector("link[rel='icon']");
    fetch('/hyperledger.svg')
        .then(response => response.text())
        .then(svg => {
            svg = svg.replace(/fill="[^"]+"/g, `fill="${color}"`);
            const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            link.href = svgUrl;
        });
}

// Call this function to change the favicon color to blue
changeFavicon('white');
