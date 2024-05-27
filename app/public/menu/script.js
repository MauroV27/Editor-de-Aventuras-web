async function loadDataFromServer() {

    const fetchData = await fetch("/api");
    let listObjects = await fetchData.json();

    for ( const doc of listObjects ){
        creatDiv(doc.data.titulo, doc.data.img, doc.id, doc)
    }

}

loadDataFromServer();


function creatDiv(titulo,img,docID,doc){

    const cards = document.getElementById("cards")

    let json = JSON.stringify(doc.data.json)
    let blob = new Blob([json], { type: 'application/json' })
    let url = URL.createObjectURL(blob)
    
    let newDiv = document.createElement("DIV")
    newDiv.innerHTML = `
        <img src=${img}>
        <h3> ${titulo}</h3> 
        <a class="play" href="/adventure/${docID}">Jogar</a>
        <a class="baixar" id = ${docID} href = ${url} download = '${titulo}.json' >Baixar</a>
    `
        //let json = JSON.stringify(doc.data.json)
        //let blob = new Blob([json], { type: 'application/json' })
        //let url = URL.createObjectURL(blob)
        //let link = document.getElementById(docID)
        //console.log(link)
        //link.href = url
        //link.download = titulo + '.json'

    // <button class='play' onclick="openPlayer(${docID})"> jogar </button>
    // "<img src=" + img + ">"+
    // "<h3>" + titulo + "</h3>" +
    // "<button class='play' id= "+ docID + "> jogar </button>"
    
    cards.appendChild(newDiv);
}


// function openPlayer(id) {

//     // const fetchData = await fetch("/api");
//     // let listObjects = await fetchData.json();
//     console.log("change page : ", id)

//     const newUrl = '/adventure/' + id;
  
//     // Utilize window.location.href para redirecionar
//     window.location.href = newUrl;
    
// }


// db.collection("arquivos")
// .get()
// .then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {

//         creatDiv(doc.data().titulo,doc.data().img, doc.id)
        
//     });
// });

// abrir e fachar o modal
// const open_modal = document.querySelector("#open_modal")
// const modal = document.querySelector("dialog")
// const close_modal = document.querySelector("#close_modal")
// const upload = document.querySelector("#upload")

// open_modal.onclick = function (){
//     modal.showModal()
// }

// close_modal.onclick = function (){
//     modal.close()
// }

// upar arquivo json e listar os cards
// const input_json = document.querySelector("#file_json")
// const input_title = document.querySelector("#file_title")
// const preview = document.querySelector("#file_preview")
// const input_img = document.querySelector("#file_img")

//selecionar imagem
// const leitor_img = new FileReader()
// let imagemSelecionada
// let urlStorage
// input_img.addEventListener("change", function(){
//     imagemSelecionada = this.files[0]
    
// }) 

// ler json como string
// let jsonReaded
// input_json.addEventListener("change", function(){
//     const file = this.files[0]
//     const leitor = new FileReader()

//     // mostrar preview do arquivo 
//     leitor.addEventListener("load", function(){
//         preview.value = leitor.result
//         jsonReaded = leitor.result
//         console.log(jsonReaded)
//     })

//     if (file){
//         leitor.readAsText(file)
//     }

// })

// adicionar informações ao storage

// function salvarImagemFirebase(){
//     const nomeImagem = input_title.value

//     const imgStorage = storage.ref().child("capas").child(nomeImagem).put(imagemSelecionada)
    
//     imgStorage.on('state-changed', function(){

//     }, function(error){
//         console.log('erro ao salvar imagem')
//     },
//     () => {
//         imgStorage.snapshot.ref.getDownloadURL().then( function (url_imagem) {
//             urlStorage = url_imagem
//             console.log(urlStorage)
    
//     })
//     }
// )
// }

// adicionar informações ao firestore

// upload.onclick = function (){

//     salvarImagemFirebase()

//     setTimeout(function() {
//         db.collection("arquivos").add({
//             titulo: input_title.value,
//             json: jsonReaded,
//             img: urlStorage,
//         })
//         .then((docRef) => {
//             modal.close()
//             window.location.reload()
//         })
//       }, 20000);

// }
