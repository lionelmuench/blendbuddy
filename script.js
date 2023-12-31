function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
}

function addColorInput() {
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#FFFFFF';
    document.getElementById('colorInputs').appendChild(colorInput);
}

function removeColorInput() {
    const colorInputsDiv = document.getElementById('colorInputs');
    if (colorInputsDiv.childElementCount > 1) {
        colorInputsDiv.removeChild(colorInputsDiv.lastChild);
    }
}

function averageColors() {
    let colors = Array.from(document.querySelectorAll('#colorInputs input')).map(input => hexToRgb(input.value));

    let totalHue = 0;
    let totalSaturation = 0;
    let totalLightness = 0;
    let hueValues = [];

    for (let [r, g, b] of colors) {
        let [h, s, l] = rgbToHsl(r, g, b);
        hueValues.push(h);
        totalSaturation += s;
        totalLightness += l;
    }

    // Adjust hue values for wrap-around if necessary
    if (Math.max(...hueValues) - Math.min(...hueValues) > 0.5) {
        hueValues = hueValues.map(h => (h < 0.5) ? h + 1 : h);
    }

    totalHue = hueValues.reduce((a, b) => a + b, 0);

    let avgHue = totalHue / colors.length % 1;
    let avgSaturation = totalSaturation / colors.length;
    let avgLightness = totalLightness / colors.length;

    let averageColor = hslToRgb(avgHue, avgSaturation, avgLightness);
    document.body.style.backgroundColor = averageColor;

    fetchColorNameFromAPI(averageColor);
}

function fetchColorNameFromAPI(rgbColor) {
    const apiEndpoint = `https://www.thecolorapi.com/id?rgb=${rgbColor.replace("rgb(", "").replace(")", "").replace(/ /g, '')}&format=json`;

    fetch(apiEndpoint)
    .then(response => response.json())
    .then(data => {
        const colorInfo = `Color Name: ${data.name.value}
            ${rgbColor}
            HEX: ${data.hex.value}
        `;
        document.getElementById('colorName').innerText = colorInfo;
    }).catch(error => {
        console.error("Error fetching color details:", error);
    });
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) r = g = b = l;
    else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}
