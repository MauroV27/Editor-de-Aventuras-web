function clamp(value, vmin, vmax){
    return Math.max( Math.min(value, vmax), vmin);
}


class InteractiveShape {

    constructor(hs, hsIndex, canvasRef) {
        this._hotspot = hs;
        this.hsIndex = hsIndex;
        this.canvaRef = canvasRef;
    }

    getOriginalHotSpotReference(){ return this._hotspot };
    
    setEditable( state ){
        // TODO : Check if state is bool type :
        this.editable = state;
    }

    // -------- Methods to overwrite -------- :

    // Return params from recreate shape :
    getParams(){
        return null;
    }

    // Called to render shape in running time : 
    render(){}
    
    // Receive a position and check if inside or outside shape :
    checkCollision(x, y, dlt = -5){                
        return false;
    }
    
    // Return an function that will be use to move shape in canvas
    moveFunction() {}

    // Return list of points in shape
    getPoints(){
        return null;
    }

    // Function that will be called after move ends
    stopMove(){}
}


class Point {
    // Classe para gerir os pontos na tela
    constructor( x, y, color, radius=20, ref=null){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.ref = ref;
    }

    render(){               // Função para desenhar os pontos na tela
        fill( this.color );
        circle(this.x, this.y, this.radius);
    }

    movePoint(npx, npy){
        this.x = clamp(npx, 10, canvas.width - 10);
        this.y = clamp(npy, 10, canvas.height - 10);
    }

    move( npx, npy ){       // Função para mover os pontos com o mouse
        this.movePoint(npx, npy);
    }
}

class RectShapeRender extends InteractiveShape{
    constructor( x, y, w, h, color="", hs, hsIndex, canvaRef ){
        super(hs, hsIndex, canvaRef);
        this.p1 = new Point( x, y, color, 5 ); // pmin
        this.p2 = new Point( x + w, y + h, color, 5 ); // pmax 
        this.color = color;

        this.p1.stopMove = () => this.stopMove();
        this.p2.stopMove = () => this.stopMove();

        this.editable = false;
    }

    getParams(){
        return {
            x: this.p1.x,
            y: this.p1.y,
            w: this.p2.x - this.p1.x,
            h: this.p2.y - this.p1.y,
        }
    }

    render(){
        if ( this.editable ){
            fill(this.color +"88");
            stroke(this.color);
    
            rect( this.p1.x, this.p1.y, this.p2.x - this.p1.x, this.p2.y  -this.p1.y );
            this.p1.render();
            this.p2.render();
        } else {
            fill(this.color +"22");
            stroke(this.color);

            rect( this.p1.x, this.p1.y, this.p2.x - this.p1.x, this.p2.y  -this.p1.y );			
        }
        
    }
    
    checkCollision(x, y, dlt = -5){                
        const collX = (x > ( this.p1.x - dlt ) && x < ( this.p2.x + dlt ));
        const collY = (y > ( this.p1.y - dlt ) && y < ( this.p2.y + dlt ));
        
        return collX && collY;
    }
    
    moveFunction() {

        if ( this.editable == false ) return null;

        const PMP1 = {x: mouseX - this.p1.x, y: mouseY - this.p1.y};
        const PMP2 = {x: mouseX - this.p2.x, y: mouseY - this.p2.y};

        return (x, y) => {
            this.p1.move( x - PMP1.x, y - PMP1.y);
            this.p2.move( x - PMP2.x, y - PMP2.y);
        }
    }

    getPoints(){
        return [ this.p1, this.p2 ];
    }

    stopMove(){
        if ( this.p1.x > this.p2.x || this.p1.y > this.p2.y ){
            const pMin = {x: Math.min(this.p1.x, this.p2.x), y : Math.min(this.p1.y, this.p2.y) };
            const pMax = {x: Math.max(this.p1.x, this.p2.x), y : Math.max(this.p1.y, this.p2.y) };

            this.p1.x = pMin.x;
            this.p1.y = pMin.y;
            this.p2.x = pMax.x;
            this.p2.y = pMax.y;
        }

        const cbb = this.canvaRef(); 

        const centerX = (cbb.sizeW) / 2;
        const centerY = (cbb.sizeH) / 2;

        // Adjust data in HotSpot shape to fit new size, convert to decimal values
        const newRectShape = new RectShape(
            clamp((this.p1.x - centerX - cbb.minX ) / cbb.sizeW, -1.0, 1.0),
            clamp((this.p1.y - centerY - cbb.minY ) / cbb.sizeH, -1.0, 1.0), 
            clamp((this.p2.x - this.p1.x ) / cbb.sizeW, 0, 1.0), 
            clamp((this.p2.y - this.p1.y ) / cbb.sizeH, 0, 1.0)
        );

        const fm = new FrameManager(); // call singleton
        const frameIndex = fm.currentFrameIndex;
        fm.updateHotSpotAreaInFrame( frameIndex, this.hsIndex, newRectShape);
    }
}

class CircleShapeRender extends InteractiveShape {
    constructor( x, y, radius, color="" , hs, hsIndex, canvaRef){
        super(hs, hsIndex, canvaRef);
        this.p1 = new Point( x, y, color, 5, "center" ); // center
        this.p2 = new Point( x + radius, y, color, 5, "radius" ); // radius 

        this.color = color;
        this.radius = radius;
        // this.newRadius = this.radius;

        this.p1.move = (x, y) => {
            this.p1.movePoint(x, y)

            this.p2.x = this.p1.x + this.radius;
            this.p2.y = this.p1.y;
        }

        this.p2.move = (x, y) => {
            this.p2.movePoint(x, y)
            this.radius = Math.sqrt( Math.pow( this.p1.x - this.p2.x, 2) + Math.pow( this.p1.y - this.p2.y, 2) );
        }

        this.p1.stopMove = () => this.stopMove("center");
        this.p2.stopMove = () => this.stopMove("radius");

        this.editable = false;
    }

    getParams(){
        return {
            x: this.p1.x,
            y: this.p1.y,
            radius: this.radius
        }
    }

    render(){
        if ( this.editable ){
            fill(this.color +"88");
            stroke(this.color);
   
            circle( this.p1.x, this.p1.y, this.radius );

            this.p1.render();
            this.p2.render();
        } else {
            fill(this.color +"22");
            stroke(this.color);

            circle( this.p1.x, this.p1.y, this.radius );			
        }
        
    }
    
    checkCollision(x, y){                
        return Math.sqrt( Math.pow( x - this.p1.x, 2) + Math.pow( y - this.p1.y, 2) ) < this.radius;
    }
    
    moveFunction() {

        if ( this.editable == false ) return null;

        const PMP1 = {x: mouseX - this.p1.x, y: mouseY - this.p1.y};
        const PMP2 = {x: mouseX - this.p2.x, y: mouseY - this.p2.y};

        return (x, y) => {
            this.p1.move( x - PMP1.x, y - PMP1.y);
            this.p2.move( x - PMP2.x, y - PMP2.y);
        }
    }

    getPoints(){
        return [ this.p1, this.p2 ];
    }

    stopMove(type){

        if ( type == "center" ){
            this.p2.x = this.p1.x + this.radius;
            this.p2.y = this.p1.y;
        } else {
            const newRadius = Math.sqrt( Math.pow( this.p1.x - this.p2.x, 2) + Math.pow( this.p1.y - this.p2.y, 2) );

            this.radius = newRadius;
            this.p2.x = this.p1.x + newRadius;
            this.p2.y = this.p1.y;
        }

        const cbb = this.canvaRef()//getCanvasBoundBox();

        const centerX = (cbb.sizeW) / 2;
        const centerY = (cbb.sizeH) / 2;

        const newCircleShape = new CircleShape(
            clamp((this.p1.x - centerX ) / cbb.sizeW, -1.0, 1.0),
            clamp((this.p1.y - centerY) / cbb.sizeH, -1.0, 1.0), 
            clamp((this.p2.x - this.p1.x ) / cbb.sizeW, 0, 1.0)
        )

        // Adjust data in HotSpot shape to fit new size, convert to decimal values
        const fm = new FrameManager(); // call singleton
        const frameIndex = fm.currentFrameIndex;

        fm.updateHotSpotAreaInFrame(frameIndex, this.hsIndex, newCircleShape);
        
    }
}

/**
 * adaptHotSpotToInteractiveRenderShape :: Convert the hostpot shape to a InteractiveShape
 * @param {HotSpot} hs - A hotspot element 
*/
function adaptHotSpotToInteractiveRenderShape( hs, offX, offY, sizeW, sizeH, hsIndex, canvasBoundBoxFunction ){

    const hsShape = hs.getShape();
    console.log(offX, offY, sizeW, sizeH)

    if ( hsShape.SHAPE_NAME == "RECT" ){
        return new RectShapeRender(
            (hsShape.x * sizeW) + offX, 
            (hsShape.y * sizeH) + offY, 
            (hsShape.w * sizeW), 
            (hsShape.h * sizeH), "#8888ee", 
            hs,
            hsIndex,
            canvasBoundBoxFunction)
    } 

    if ( hsShape.SHAPE_NAME == "CIRCLE" ) {
        return new CircleShapeRender(
            (hsShape.x * sizeW) + offX, 
            (hsShape.y * sizeH) + offY, 
            (hsShape.radius * sizeW), "#8888ee",
            hs,
            hsIndex,
            canvasBoundBoxFunction)
    }

    return null;
}


/* Function that find rescale values to image fill canvas keeping the resoluution */
// TODO : Find better place/file to put this code
function calculatCurrentFrameImageRect(  minX, minY, sizeW, sizeH, imgWidth, imgHeight) {
    
    const imgLimits = {};    

    const widthRatio = sizeW / imgWidth;
    const heightRatio = sizeH / imgHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    imgLimits.w = imgWidth  * ratio;
    imgLimits.h = imgHeight * ratio;
    
    imgLimits.x = minX + abs( sizeW - imgLimits.w )/2;
    imgLimits.y = minY + abs( sizeH - imgLimits.h )/2;

    return imgLimits;
}


/* 
Problemas a resolver no editor : 

- Salvar as informações em algum arquivo ( baixar ? ); ✅
- Posições e tamanhos estão em valores absolutos ( necessário normalizar ); ✅
- Posições começam do ponto ( 0,0 ) externo a imagem ( 10, 10 ); ✅
- Importar dados;
- Sem suporte para mobile ( edição );
- Sem interface ( apenas o modelo de teste );
- Código complexo e confuso ( organizar código nos arquivos ); ✅
- Mistura da camada de dados ( components.js ) com o código da interface; (???)
- Desacoplar código; ✅
- Classes parecidas e com funções diferentes; ✅
- Performance do código é desconhecida;
- Muito código desnecessário e não mais funcional comentado : ✅
- feature : Modo de teste, implementar um mecanismo rápido de teste com o jogo;
- feautre : Player, implementar a leitura e interação com base nos dados gerados pelo editor;

*/