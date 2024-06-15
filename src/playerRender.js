class PlayerRender {

    constructor(canvas, ctx){
        this.mouseX = 0;
        this.mouseY = 0;

        this.CANVAS_BORDER = 0;

        this.canvas = canvas; //document.querySelector('#frameCanvas');
        this.ctx = ctx;
        
        // List of hotspots that appear in current frame loaded in canvas
        this.hotSpotsListRender = [];

        this.image = null;
        this.imgProperties = {};
        this.indexFrameView = -1;
    
        this.frameManager = new FrameManager(); // Handle all data in aplication
        this.isToRenderHotSpots = true;

        this.frameManager.setCanvasArea(
            this.CANVAS_BORDER,
            this.CANVAS_BORDER,
            (this.canvas.width - (2*this.CANVAS_BORDER)),
            (this.canvas.height - (2*this.CANVAS_BORDER))
        )
    }

    async loadDataFromServer(adventureID){

        // Load data from server : 
        const resp = await fetch("/api/" + adventureID);
        const doc = await resp.json();
        const jsonData = doc.json;

        // Load data in FrameManager : 
        this.indexFrameView = 0;

        this.frameManager.importDataInJSON(jsonData);

        console.log("Leu json");
    }

    trackInputPosition(window, eventName){
        window.addEventListener(eventName, (event) => this.trackMousePosition(event), false);
    }

    /**
     * Convert mouse event to canvas region
    */ 
    trackMousePosition(event){
        let rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.pageX - rect.left;
        this.mouseY = event.pageY - rect.top;
    }

    /** 
     * renderOnCanvas :: Manager the renderization of canvas screen. 
     * This method does not support dynamic updates of elements on the screen, but is the basis for how screen updates run in the EditorRender class
    */
    renderOnCanvas(){

        background("#fff");
        fill("#333333");
        rect(this.CANVAS_BORDER, this.CANVAS_BORDER, this.canvas.width - (2*this.CANVAS_BORDER), this.canvas.height - (2*this.CANVAS_BORDER),);

        // Render frame image : 
        drawImage(this.image, this.imgProperties.xOffset, this.imgProperties.yOffset, this.imgProperties.newWidth, this.imgProperties.newHeight )

        // Render hotspots : 
        for ( const hs of this.hotSpotsListRender ){
            hs.render();
        }

    }


    selectPoint(event){

        const getShape = this.checkCollision(this.mouseX, this.mouseY);

        if ( getShape == null ) return;

        const originalHotSpot = getShape.getOriginalHotSpotReference();
        this.indexFrameView = originalHotSpot.getNextFrame();

        this.renderCurrentFrame();          
    }


    checkCollision(x, y) {

        for ( let i = this.hotSpotsListRender.length - 1; i >= 0 ; i-- ){
            const sp = this.hotSpotsListRender[i];
            if ( sp.checkCollision( x, y ) ){
                return sp;
            }
        }

        return null;
    }


    /**
     * Function that process image to resize and fill canvas 
     * @param {Image} image Image object
     * @param {Object} cbb Canvas Bound Box, contais position and size of utils area to render image
     * @param {Object} imgProperties Object with image limits to fit cbb and keep resolution
     */
    processImageToFillCanvas(image, cbb) {
        const widthRatio = cbb.sizeW / image.width;
        const heightRatio = cbb.sizeH / image.height;
        const ratio = Math.min(widthRatio, heightRatio);

        this.imgProperties.newWidth  = Math.floor( image.width  * ratio);
        this.imgProperties.newHeight = Math.floor( image.height * ratio);

        this.imgProperties.xOffset = Math.round( cbb.minX + Math.abs( cbb.sizeW - this.imgProperties.newWidth ) /2 );
        this.imgProperties.yOffset = Math.round( cbb.minY + Math.abs( cbb.sizeH - this.imgProperties.newHeight) /2 );

        this.imgProperties.ratio = ratio;
    }

    renderCurrentFrame(){

        const frame = this.frameManager.getFrame( this.indexFrameView );
        this.hotSpotsListRender.length = 0; // clear list of hotspots in render
        
        const hotSpotsInFrame = frame.getHotSpots();

        const callRender = async () => {

            if (this.isToRenderHotSpots){

                for ( const index in hotSpotsInFrame ){
                    const hs = hotSpotsInFrame[ index ];
                    if ( hs == null ) continue;

                    const adapter = adaptHotSpotToInteractiveRenderShape(
                        hs, // HotSpot Data
                        this.canvas.width/2, // canvas center x
                        this.canvas.height/2, // canvas center y
                        this.canvas.width - (2*this.CANVAS_BORDER), // canvas size X without borders
                        this.canvas.height - (2*this.CANVAS_BORDER), // canvas size Y without borders
                        index // hotspot index
                    )

                    // console.log("Adpater : ", adapter)
                    this.hotSpotsListRender.push( adapter );
                }

            } 
        
            this.renderOnCanvas();
        }

        this.loadImageInFrame(frame.getImage(), () => callRender());
    }   

    loadImageInFrame(imgSrcUrl, callBack){
        const img = new Image();
        img.src = imgSrcUrl;
        
        const cbb = this.frameManager.getCanvasArea();

        // JS n consegue entender o this dentro da função onload da imagem
        const loadImageFucntion = (img, cbb) => {
            this.processImageToFillCanvas(img, cbb);
        }

        img.onload = async function () {      
                       
            if (img == null) return;
            loadImageFucntion(img, cbb);

            await callBack();
        };

        this.image = img;

    }

}