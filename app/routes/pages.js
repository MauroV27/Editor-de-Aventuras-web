import path from 'path';

const __dirname = path.resolve(path.dirname(''));

export function connectPageRoutes(router) {
    router.get("/", function(req, res){
        res.sendFile(path.join(__dirname, '/app/public/menu/index.html'))
    });

    router.get("/adventure/:id", function(req, res){
        res.sendFile(path.join(__dirname, '/app/public/player/player.html'))
    });

    router.get("/adventure/edit/:id", function(req, res){
        res.sendFile(path.join(__dirname, '/app/public/editor/editor.html'))
    });

}