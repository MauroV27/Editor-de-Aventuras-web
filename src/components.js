// Code for base data management of elements in Frames and HotSpots

// Base class for any hotspot shape ( ABSTRACT )
// Works to store data
class AbstractShape { 
    SHAPE_NAME = ''

    checkPointInside(x, y) {
        return false;
    }

    //move(x, y) {}; // abstract method that must be implemented in childrens

    getType() { return this.SHAPE_NAME };
}


class RectShape extends AbstractShape {
    SHAPE_NAME = "RECT"
    static getType() { return "RECT" };

    constructor( px, py, w, h){
        super();
        this.x = px;
        this.y = py;
        this.w = w;
        this.h = h;
    }

    checkPointInside(x, y){
        const coll_x = x > this.px && x < ( this.px + this.w );
        const coll_y = y > this.py && y < ( this.py + this.h );

        return coll_x && coll_y;
    }

    updateParams( param ){
        this.x = param.x;
        this.y = param.y;
        this.w = param.w;
        this.h = param.h;
    }

    getData(pixelUnitX=1, pixelUnitY=1){
        return {
            x: this.x * pixelUnitX,
            y: this.y * pixelUnitY,
            w: this.w * pixelUnitX,
            h: this.h * pixelUnitY,
        }
    }
}

class CircleShape extends AbstractShape {
    SHAPE_NAME = "CIRCLE"
    static getType() { return "CIRCLE" };

    constructor( px, py, radius){
        super();
        this.x = px;
        this.y = py;
        this.radius = radius;
    }

    checkPointInside(x, y){
        return Math.sqrt( Math.pow( x - this.x, 2) + Math.pow( y - this.y, 2) ) < this.radius;
    }

    updateParams( param ){
        this.x = param.x;
        this.y = param.y;
        this.radius = param.radius;
    }

    getData(pixelUnitX=1, pixelUnitY=1){
        return {
            x: this.x * pixelUnitX,
            y: this.y * pixelUnitY,
            radius: this.radius * pixelUnitX
        }
    }
}


class HotSpot {
    constructor( shape, nextFrameIndex ){

        const shapeIsValid = shape instanceof AbstractShape;
        const nextFrameIndexIsValid = ( nextFrameIndex != null && nextFrameIndex >= 0 );
        
        if ( !shapeIsValid ) throw new Error("Shape must be a value that implements for class AbstractShape");
        if ( !nextFrameIndexIsValid ) throw new Error("Index must be a integer greater or equal to zero");

        this.shape = shape;
        this.next = nextFrameIndex;

        this.justOneTime = false;
        this.clicks = 0;
    }

    checkPointInside( x, y ){

        if ( this.justOneTime && this.clicks > 0 ) return false;

        const isColliding = this.shape.checkPointInside( x, y );

        if ( isColliding && this.justOneTime ){
            this.clicks += 1;
        }

        return isColliding && ( this.clickLimit <= 1 )
    }

    getNextFrame(){
        return this.next;
    }

    getShape(){
        return this.shape;
    }

    setShape( shape ){
        this.shape = shape;
    }

    getData(pixelUnitX=1, pixelUnitY=1){
        const hsData = {};

        hsData.target = this.next;
        hsData.shapeType = this.shape.getType();
        hsData.shape = this.shape.getData(pixelUnitX, pixelUnitY);

        return hsData;
    }
}

class Frame { 
    constructor(imageRef, frameName){
        this.imageRef = imageRef;
        this.name = frameName;
        this.hotspots = [];
    }

    addHotSpot( hs ){
        if ( hs instanceof HotSpot ){
            this.hotspots.push( hs );
        } else {
            throw new Error('InvalidArgumentException: argument must be an instance of HotSpot class')
        }
    }

    deleteHotSpot( HotSpotToRemove ){
        if ( this.frameHasHotSpot( HotSpotToRemove ) ) {
            delete this.hotspots[HotSpotToRemove];
        }
    }

    updateHotSpotArea(hotSpotIndex, params){
        if ( this.frameHasHotSpot(hotSpotIndex) ){
            this.hotspots[ hotSpotIndex ].shape.updateParams( params );
        }
    }   

    frameHasHotSpot( hotSpotIndex ){
        return hotSpotIndex >= 0 && hotSpotIndex < this.hotspots.length;
    }

    mouseClick(x, y){
        // return -1 if none hotspot was clicked

        for ( hs of this.hotspots ){
            if ( hs.checkPointInside(x,y ) ) {
                return hs.getNextFrame();
            }
        }

        return -1;
    }

    getImage(){
        return this.imageRef;
    }

    getName(){
        return this.name;
    }

    getHotSpots(){
        return this.hotspots;
    }

    getData(pixelUnitX, pixelUnitY){
        const frameData = {};

        frameData.frameName = this.name;
        frameData.frameImg = this.imageRef;

        const hsData = [];

        for ( const index in this.hotspots ){
            const hs = this.hotspots[ index ];
            const d = hs.getData(pixelUnitX, pixelUnitY);
            d.id = parseInt(index);

            hsData.push( d );
        }

        frameData.hotspots = [...hsData];

        return frameData;
    }
}

/**
 * Class that manager all data in aplication ( player or editor )
 * It has functions to work with
 */
class FrameManager {

    #canvasArea = {minX:0, minY:0, sizeW:0, sizeH:0};

    // CHECK : Is better to add method to canvas size in FrameManager (???)
    constructor(){
        if ( FrameManager._instance ){
            return FrameManager._instance;
        } else {
            // TODO : Convert to private var
            this.frameList = []; 
            // TODO : Convert to private var
            this.currentFrameIndex = null;
            FrameManager._instance = this;
        }
    }

    setCanvasArea(minX, minY, sizeW, sizeH) {
        this.#canvasArea = {minX, minY, sizeW, sizeH};
    }

    getCanvasArea(){
        return this.#canvasArea;
    }


    addFrame( frame ){
        if ( frame instanceof Frame ){
            this.frameList.push( frame );
        } else {
            throw new Error('InvalidArgumentException: argument must be an instance of Frame class')
        }
    }

    getFrame( index ){
        if (  this.isValidFrame( index ) ){
            return this.frameList[ index ];;
        }

        return null;
    }

    updateHotSpotAreaInFrame(frameIndex, hotspotIndex, params){
        this.frameList[ frameIndex ].updateHotSpotArea( hotspotIndex, params );
    }

    deleteFrame( index ){
        // TODO : Add method to delete all hotspots that point for deleted frame    
        if ( this.isValidFrame(index) ){
            this.frameList.splice(index, 1)
        }
    }

    isValidFrame( index ){
        return index >= 0 && index < this.frameList.length;
    }

    getFrames() {
        return this.frameList;
    }

    setCurrentFrameIndex( index ){
        if ( this.isValidFrame( index ) ){
            this.currentFrameIndex = index;
        }   
    }

    clear(){
        this.frameList = [];
        this.currentFrameIndex = 0; 
    }

    exportDataInJSON() {
        
        // Values to normalize elements in screen
        const sizeWidth  = this.#canvasArea.sizeW - (2*this.#canvasArea.minX);
        const sizeHeight = this.#canvasArea.sizeH - (2*this.#canvasArea.minY);
        const resolution = Math.max( sizeWidth, sizeHeight);
        const pixelUnitX = sizeWidth / resolution;
        const pixelUnitY = sizeHeight / resolution;

        const data = {};

        const frames = [];

        for ( const index in this.frameList ){
            const f = this.frameList[ index ];
            const d = f.getData(pixelUnitX, pixelUnitY);
            d.id = parseInt(index);

            frames.push( d );
        }

        data.frames = frames;
        
        data.screen = {
            unitSize : {
                x : pixelUnitX,
                y : pixelUnitY
            },
            size : {
                x : sizeWidth,
                y : sizeHeight
            }
        }

        return data;
    }

    importDataInJSON(json){
        // Clear data in FrameManager : 
        this.clear();

        // Adjust resolution 
        const sizeWidth  = this.#canvasArea.sizeW - (2*this.#canvasArea.minX);
        const sizeHeight = this.#canvasArea.sizeH - (2*this.#canvasArea.minY);

        const orgSize = json.screen.size;

        const originalRatio = Math.min(orgSize.x, orgSize.y) / Math.max(orgSize.x, orgSize.y);
        const playerRatio = Math.min(sizeWidth, sizeHeight) / Math.max(sizeWidth, sizeHeight);
        const resolution = Math.max( sizeWidth, sizeHeight);

        // const unitX = resolution / ( json.screen.unitSize.x * sizeWidth );
        // const unitY = resolution / ( json.screen.unitSize.y * sizeHeight );
        const unitX = (resolution / sizeWidth ) / ( originalRatio / playerRatio );// * json.screen.unitSize.x;
        const unitY = (resolution / sizeHeight) / ( originalRatio / playerRatio );// * json.screen.unitSize.y;

        // console.log(unitX, unitY)

        const frameListData = json.frames;

        for ( const frameData of frameListData ){
            const frame = new Frame(frameData.frameImg, frameData.frameName);

            for ( const hs of frameData.hotspots ){
                const shapeBuilder = this.#shapeTypeBuilder(hs.shapeType, hs.shape, unitX, unitY);
                // if ( shapeBuilder == null ){
                //     console.error(`Problema na reconstrução do hotspot: ${hs.toString()}`)
                //     continue;
                // }
                console.log(hs.shapeType, shapeBuilder)
                const hotSpot = new HotSpot(shapeBuilder, hs.target);
                frame.addHotSpot(hotSpot);
            }

            this.frameList.push(frame);
        }

    }


    #shapeTypeBuilder(shapeType, shapeData, pixelUnitX, pixelUnitY){

        console.log("FrameManager.#shapeTypeBuilder: ", shapeData, shapeType);

        if ( shapeType == RectShape.getType() ){
            return new RectShape(
                shapeData.x * pixelUnitX,
                shapeData.y * pixelUnitY,
                shapeData.w * pixelUnitX,
                shapeData.h * pixelUnitY
            );
        } else if ( shapeType == CircleShape.getType() ){
            return new CircleShape(
                shapeData.x * pixelUnitX, 
                shapeData.y * pixelUnitY, 
                shapeData.radius * pixelUnitX
            );
        } 

        return null;
    }
}

// To check if enviroment is Node or browser. If in Node.js window will be undefined
if (typeof window === 'undefined'){
    module.exports = {FrameManager, Frame, HotSpot, RectShape, CircleShape};
}