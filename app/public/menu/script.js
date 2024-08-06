

class Card {
    constructor(titulo, img, docID, doc){
        this.titulo = titulo
        this.img = img
        this.docID = docID
        this.doc = doc
    }

    baixar(){
        let json = JSON.stringify(this.doc.data.json)
        let blob = new Blob([json], { type: 'application/json' })
        let url = URL.createObjectURL(blob)
        return url
    }

    html(){
        let newDiv = document.createElement("div")
        newDiv.innerHTML = `
            <img src=${this.img}>
            <h3> ${this.titulo}</h3> 
            <md-filled-button class="play" href="/adventure/${this.docID}">jogar</md-filled-button>
            <md-filled-button class="baixar" href = ${this.baixar()} download = '${this.titulo}.json' >Baixar</md-filled-button>
            <md-filled-button class="editar" href="/adventure/edit/${this.docID}">editar</md-filled-button>
            <md-filled-button class="duplicar" id="duplicar${this.docID}" href="#" >duplicar</md-filled-button>
            <md-filled-button class="excluir" id="excluir${this.docID}" href="#" >excluir</md-filled-button>
        `
        cards.appendChild(newDiv);
        let docID = this.docID
        document.getElementById(`duplicar${this.docID}`).addEventListener("click", function(){
            fetch(`/api/copy/${docID}`, {
                method: "post",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                  
                //make sure to serialize your JSON body
                body: JSON.stringify({
                  img: this.img,
                  json: null,
                  titulo: this.titulo
                })
                })
                .then( (response) => { 
                    console.log('duplicou')
                })
        })

        document.getElementById(`excluir${this.docID}`).addEventListener("click", function(){
            fetch(`/api/${docID}` , {
                method: "delete"
            }).then( (response) => { 
                console.log("deletado com sucesso")
            })
        })
    }

    detalhes(){

    }
}

async function loadDataFromServer() {

    const fetchData = await fetch("/api");
    let listObjects = await fetchData.json();

    for ( const doc of listObjects ){
        let card = new Card(doc.data.titulo, doc.data.img, doc.id, doc)
        card.html()
    }

}

const cards = document.getElementById("cards")
loadDataFromServer();
