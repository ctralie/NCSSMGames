function DrawText() {
    var canvasX, canvasY;
    var textX, textY;

    var text = [];
    var textToWrite = "1";
    
    var maxWidth = 256;
    
    var squareTexture = true;
    
    var textHeight = 56;
    var textAlignment = 'Centre';
    var textColour = '#333';
    var fontFamily = 'monospace';
    
    var backgroundColour = '#FFF';
    
    var canvas = document.getElementById('textureCanvas');
    var ctx = canvas.getContext('2d');
    
    ctx.font = textHeight+"px "+fontFamily;
    if (maxWidth && measureText(ctx, textToWrite) > maxWidth ) {
        maxWidth = createMultilineText(ctx, textToWrite, maxWidth, text);
        canvasX = getPowerOfTwo(maxWidth);
    } else {
        text.push(textToWrite);
        canvasX = getPowerOfTwo(ctx.measureText(textToWrite).width);
    }
    canvasY = getPowerOfTwo(textHeight*(text.length+1)); 
    if(squareTexture) {
        (canvasX > canvasY) ? canvasY = canvasX : canvasX = canvasY;
    }
    document.getElementById('calculatedWidth').value = canvasX;
    document.getElementById('calculatedHeight').value = canvasY;

    canvas.width = canvasX;
    canvas.height = canvasY;
    
    switch(textAlignment) {
        case "left":
            textX = 0;
            break;
        case "center":
            textX = canvasX/2;
            break;
        case "right":
            textX = canvasX;
            break;
    }
    textY = canvasY/2;
    
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.fillStyle = textColour;
    ctx.textAlign = textAlignment;
    
    ctx.textBaseline = 'middle'; // top, middle, bottom
    ctx.font = textHeight+"px "+fontFamily;
    
    var offset = (canvasY - textHeight*(text.length+1)) * 0.5;
    
    for(var i = 0; i < text.length; i++) {
        if(text.length > 1) {
            textY = (i+1)*textHeight + offset;
        }
        ctx.fillText(text[i], textX,  textY);
    }
}
