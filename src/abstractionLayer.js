/* 
Class for abstract methods of canvas/HTML, incorporing elements to make more simple render elements in screen 
*/

// ---------- Basic render functions ----------
// ---------- Code for canvas work ------------
function fill(color) {
    ctx.fillStyle = color;
    // ctx.fill();
}

function stroke(color){
    ctx.strokeStyle = color;
    ctx.stroke();
}

function strokeWeight(weight){
    ctx.lineWidth = weight;
}

function rect(x, y, w, h){
    ctx.beginPath();
    ctx.fillRect(x, y, w, h); 
    ctx.rect(x, y, w, h); 
    // ctx.fill();
    ctx.stroke();
}

function line(x, y, x1, y1){
    ctx.beginPath(); 
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function circle(x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function background(color){
    fill(color);
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
}

function drawImage(image, xOffset, yOffset, newWidth, newHeight){
    ctx.drawImage(image, xOffset, yOffset, newWidth, newHeight);
}

// ---------- Code for canvas work -------- END

//#region :: File manager functions : 

function generateJSONFileByData(data, fileName, htmlDocument){

    // Create element with <a> tag
    const link = htmlDocument.createElement("a");
    
    // // Create a blog object with the file content which you want to add to the file
    const file = new Blob([data], { type: 'text/plain' });
    
    // // Add file content in the object URL
    link.href = URL.createObjectURL(file);
    
    // // Add file name
    link.download = fileName;
    
    // // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
    
    console.log([data])
    console.log(`Arquivo ${fileName} gerado`)
}