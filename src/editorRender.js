class EditorRender extends PlayerRender {
    
    constructor(canvas, ctx){
        super(canvas, ctx);
        
        this.CANVAS_BORDER = 10;

        this.selectedShapeReference = null; // To store moveFunction in shape
        this.isEditingHotSpot = false; // bool var to allow edit hotspot
        this.indexHotSpot = -1;

        // Reload canvas size to fit new border size : 
        this.frameManager.setCanvasArea(
            this.CANVAS_BORDER,
            this.CANVAS_BORDER,
            (this.canvas.width - (2*this.CANVAS_BORDER)),
            (this.canvas.height - (2*this.CANVAS_BORDER))
        )

        this.animationID = null;
        this.adventureID = null; // store adventure id
    }


    /**
     * @override to render frame list after load data from server 
     */
    async loadDataFromServer(adventureID){
        await super.loadDataFromServer(adventureID);
        this.adventureID = adventureID;
        this.renderFrameList();
    }


    async saveDataInServer(){

        const sendData = JSON.stringify(this.frameManager.exportDataInJSON());

        // Save data from server : 
        const resp = await fetch("/api/" + this.adventureID, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                json: sendData
            })
        });

        // const doc = await resp.json();

        // console.log("DOC response from save : ", doc);

        // Show popup warning that js
        alert("Servidor recebeu atualizações");

        console.log("Json foi salvo no servidor!");
    }

    
    /** 
     * @override
     * renderOnCanvas :: Manager the renderization of canvas screen. Can handle one single update or many by oneTime properties
     * @param {boolean} oneTime = false :: if true renders only one sigle frame. The default value implies that will be render continuos frames
    */
    renderOnCanvas(oneTime = false){
        super.renderOnCanvas();

        if ( oneTime == true ) return this.stopUpdateRender();

        const updateCanvas = () => {

            super.renderOnCanvas();
    
            if ( this.selectedShapeReference != null ) {
                this.selectedShapeReference.move( this.mouseX, this.mouseY);
            }

            this.animationID = requestAnimationFrame(updateCanvas); 
        }

        this.animationID = requestAnimationFrame(updateCanvas);
    }

    stopUpdateRender(){
        cancelAnimationFrame(this.animationID);
        this.animationID = null;
    }


    move(event) {
        // doesn't implement anything
        // if ( this.isEditingHotSpot == false ) return;
        // if ( this.selectedShapeReference == null ) return;
    }

    deselect(event){
        if ( this.isEditingHotSpot == false ) return;
        if ( this.selectedShapeReference != null && this.selectedShapeReference.stopMove != undefined ) {
            this.selectedShapeReference.stopMove();
        }

        this.hotSpotsListRender[this.indexHotSpot].setEditable(false);
        this.selectedShapeReference = null;
        this.isEditingHotSpot = false;
        
        this.indexHotSpot = -1;
        this.renderOnCanvas(true)
    }
    
    checkPoint(x, y){
        for ( const sp of this.hotSpotsListRender ){
            for ( const p of sp.getPoints() ){
                const d = Math.sqrt( Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
                if ( d < p.radius ){
                    return p;
                }
            }

        }

        return null;
    }

    selectPoint( event ){

        // Select a point or shape that users was clicked
        if ( this.isEditingHotSpot == false ) return;

        const point = this.checkPoint(this.mouseX, this.mouseY);

        if ( point ){
            this.selectedShapeReference = point;
            this.renderOnCanvas(false);
            return;
        } 

        const getShape = this.checkCollision(this.mouseX, this.mouseY); // Method from PlayerRender Class

        if ( getShape == null ) return;

        const moveFunc = getShape.moveFunction(this.mouseX, this.mouseY); // recebe uma função que move o shape selecionado

        this.selectedShapeReference = {
            move : (x, y) => { moveFunc(x, y); }, // function to move shape
            stopMove : () => { getShape.stopMove(); }, // function to call when stop move shape
        }

        this.renderOnCanvas(false);
       
    }


    //#region :: Frame functions --------------------------------------

    addFrame(){
        // TODO : Improve frame creation flow, implement error prevention
        const urlImage = prompt("Digite o endereço de uma imagem : ");
        const frameName = prompt("Digite o nome do frame :") || "Frame " + ( this.frameManager.getFrames().length + 1 )

        if ( urlImage == null ) return;

        this.frameManager.addFrame( new Frame(urlImage, frameName) );
        this.renderFrameList();
    }

    renderFrameList(){
        const frameList = document.querySelector(".framesList");

        let textHTML = ''

        for ( const index in this.frameManager.getFrames() ){

            const frame = this.frameManager.getFrame( index );
            const fName = frame.getName();

            textHTML += `
                <div class="itemElement">
                    <img src="${frame.getImage()}" alt="imagemN" onclick="selectFrame(${index})">
                    <p class="frameName" title="${fName}">${fName.slice(0, 12)}</p>
                    <button onclick="removeFrame(${index})">X</button>
                </div>`                    
        }
        
        frameList.innerHTML = textHTML;
    }

    removeFrame( index ){
        const confirm = window.confirm("Deseja deletar esse frame?");

        if ( this.indexFrameView == index ){
            this.indexFrameView = -1;
            this.renderCurrentFrame();
        }

        if ( confirm ){
            // TODO : Validate index before acess : 
            this.frameManager.deleteFrame( index );
            this.renderFrameList();
        }
    }

    selectFrame(index) {
        this.indexFrameView = index;
        this.frameManager.setCurrentFrameIndex( index );
        this.renderCurrentFrame();
    }

    renderCurrentFrame(){
        
        const frameName = document.querySelector('#nameFrameView');
        const frameHotSpots = document.querySelector('.hotspotList');

        if ( this.indexFrameView < 0 ){
            frameName.textContent = "";
            frameHotSpots.innerHTML = "";
            return;
        }

        const frame = this.frameManager.getFrame( this.indexFrameView );
        this.hotSpotsListRender.length = 0; // clear list of hotspots in render

        if ( frame == null || frame == undefined ) return; // theres no data to show

        const hotSpotsInFrame = frame.getHotSpots();
        // console.log("hotspots in frame :", hotSpotsInFrame)

        frameName.textContent = frame.getName();

        let textHTML = ''

        for ( const index in hotSpotsInFrame ){
            const hs = hotSpotsInFrame[ index ];
            if ( hs == null ) continue;

            const adapter = adaptHotSpotToInteractiveRenderShape(
                hs, // HotSpot Data
                this.canvas.width/2, this.canvas.height/2, // canvas center
                this.canvas.width - (2*this.CANVAS_BORDER), this.canvas.height - (2*this.CANVAS_BORDER), // canvas size without borders
                index // hotspot index
            )

            this.hotSpotsListRender.push( adapter )
            const gotoFrame = this.frameManager.getFrame( hs.getNextFrame() ).getName();

            textHTML += `                        
                <div class="itemElement">
                    <p>${gotoFrame}</p>
                    <div class="actionHotSpot">
                        <button onclick="editHotSpot(${this.indexFrameView}, ${index})">✎</button>
                        <button onclick="deleteHotSpot(${this.indexFrameView}, ${index})">🗑️</button>
                    </div>
                </div>`;
        }

        frameHotSpots.innerHTML = textHTML;

        this.loadImageInFrame(frame.getImage(), () => this.renderOnCanvas(true));
    }

    //#endregion :: Frame functions ---------------------------------- END

    
    //#region :: HotSpot functions ------------------------------------

    openPopup() {

        if ( this.indexFrameView < 0 ){
            alert("Crie ou selecione um frame para adicionar uma área clicavel!");
            return;
        }

        const modal = document.querySelector("#modalOne");
        modal.style.display = "block";

        let options = ""

        for ( const index in this.frameManager.getFrames() ){
            if ( index != this.indexFrameView ){
                options += `<option value="${index}">${this.frameManager.getFrame(index).getName()}</option>`
            }
        }

        modal.innerHTML = `
            <div class="modal-content" id="modalReference">
                <h3>Criar interação</h3>
            
                <!-- <a class="close">&times;</a> -->
                <div class="modal-row">
                    <label for="hotSpotShapeType">Tipo de interação:</label>
                    <select name="hotSpotShapeType" id="hotSpotShapeType">
                        <option value="RECT">Rect</option>
                        <option value="CIRCLE">Circle</option>
                    </select>
                </div>

                <div class="modal-row">
                    <label for="hotSpotTarget">Vá para o frame :</label>
                    <select name="hotSpotTarget" id="hotSpotTarget">
                        ${options}
                    </select>
                </div>

                <div class="modal-row">
                    <button onclick="addHotSpot()">Adicionar</button>
                    <button onclick="closePopup()">Cancelar</button>
                </div>
            </div>`            
    }

    closePopup() {
        const modal = document.querySelector("#modalOne");
        modal.style.display = "none";
        modal.innerHTML = ""
    }

    addHotSpot(){
        const shapeType = document.getElementById("hotSpotShapeType"); 
        const taregtFrame = document.getElementById("hotSpotTarget");
        
        const [centerX, centerY] = [0, 0];
        const ScaleSize = 0.05;

        let shape = null;
        switch ( shapeType.value ) {
            case "RECT":
                shape = new RectShape(centerX - ScaleSize, centerY - ScaleSize, 2*ScaleSize, 2*ScaleSize);
                break;

            case "CIRCLE":
                shape = new CircleShape(centerX, centerY, 2*ScaleSize);
                break;
        
            default:
                return;
                break;
        } 

        if ( shape == null || taregtFrame == null ){
            alert("Problem in create hotspot, please try again!")
            return;
        }

        const hs = new HotSpot(shape, parseInt(taregtFrame.value));

        this.frameManager.getFrame( this.indexFrameView ).addHotSpot( hs );
        this.closePopup();
        this.selectFrame( this.indexFrameView );
    }

    editHotSpot(frameIndex, hotSpotIndex ) {

        if ( frameIndex != this.indexFrameView ) return;

        const frame = this.frameManager.getFrame( this.indexFrameView );
        const hs = frame.getHotSpots()[hotSpotIndex];
        // TODO : Add param to modify hotspot;        

        // TODO : Implement prompt for customize target
        // const newHotSpotTarget = confirm("Deseja mudar para onde a área clicavel leva? ");
        // if ( newHotSpotTarget ){
            
        // }

        for ( const index in this.hotSpotsListRender){
            this.hotSpotsListRender[index].setEditable(index == hotSpotIndex);
        }

        this.isEditingHotSpot = true;
        this.indexHotSpot = hotSpotIndex;
        this.renderOnCanvas(true);
    }

    deleteHotSpot(frameIndex, hotSpotIndex) {
        if ( frameIndex != this.indexFrameView ) return;

        const confirm = window.confirm("Deseja deletar essa área clicavel?");

        if ( confirm ){
            const frame = this.frameManager.getFrame( this.indexFrameView );

            frame.deleteHotSpot( parseInt(hotSpotIndex) );
            this.renderCurrentFrame();
        }

    }

    //#endregion HotSpot functions -------------------------------- END
}