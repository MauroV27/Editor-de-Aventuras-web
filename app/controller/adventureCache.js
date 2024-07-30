
export class CacheAPI {


    /**
     * @param {int} maxQueusInCache Recebe um número máximo de valores para armazernar
     * @param {int} minutesToAutoRemove Recebe o intervalo de tempo para remover valores inacessados
    */
    constructor(maxQueusInCache, minutesToAutoRemove){
        this._lastAdventures = {};
        this._queueAdventures = [];

        this._maxAdventuresInCache = maxQueusInCache;
        this._timeToCallAutoRemove = minutesToAutoRemove;
        this._autoRemoveIsActive = false;
    }

    maxQueusInCache(){
        return this._maxAdventuresInCache;
    }


    /**
     * Essa função é executada a cada N minutos para remover os jsons que não foram acessados nos ultimos N minutos
    */
    autoRemove(){
        const currentTime = Date.now();
        const minute = 1000 * 60;

        for ( const i in this._queueAdventures ){

            const queue = this._queueAdventures[i];

            // Se queue.time for undefined ou null, então vai passar 0, se for 0 ele vai ser deletado
            const timeElapsed = Math.round( (currentTime - ( queue.time || 0 ) ) / minute );

            if ( timeElapsed >= this._timeToCallAutoRemove ){
                delete this._lastAdventures[queue.id];
                delete this._queueAdventures[i]; // this._queueAdventures[i] = undefined
            }

        }

        const queuesToKeep = [];

        for ( const i in this._queueAdventures ){
            // Verifica se queue possui valor valido
            const queue = this._queueAdventures[i];
            if ( queue ){
                queuesToKeep.push(queue);
            }
        }

        
        // Orderna os index da lista com base no tempo
        queuesToKeep.sort( (a, b) => {
            a.time < b.time
        });
        
        this._queueAdventures = queuesToKeep;
        
        // Se não houver mais nenhum elemento na lista, então o código não chama a função de auto remove
        if ( this._queueAdventures.length > 0 ){
            setTimeout(this.autoRemove, this._timeToCallAutoRemove * minute);
        } else {

            this._queueAdventures.length = 0;

            // Para garantir que _lastAdventures não tenha nenhum objeto armazenado
            for (const key in Object.getOwnPropertyNames(this._lastAdventures || {})) {
                const prop = this._lastAdventures[key];
                if ( prop ){
                    delete obj[prop];
                }
            }

            this._autoRemoveIsActive = false;
        }

    }


    getAdventure( adventureID ){
        if ( this._lastAdventures[adventureID] !== undefined ){
            // return {
            //     id : adventureID,
            //     data: this._lastAdventures[adventureID]
            // };
            return this._lastAdventures[adventureID];
        }

        return null;
    }

    getAllAdventuresInCache(){
        const listAdventures = [];

        for ( const adventureID of this._queueAdventures ){
            listAdventures.push({
                ...this._lastAdventures[adventureID], id:adventureID
            })
        }

        return listAdventures;
    }

    /**
     * 
     * @param {String} adventureID 
     * @returns {Boolean} 
     */
    has(adventureID){
        return this._lastAdventures[adventureID] !== undefined;
    }

    numQueuesCached(){
        return this._queueAdventures.length;
    }


    insert( adventureID, adventure ){
        if ( Object.keys(this._lastAdventures).length >= this._maxAdventuresInCache ){
            const olderAdventureInList = this._queueAdventures.shift();

            delete this._lastAdventures[olderAdventureInList.id];
            
            this._queueAdventures.push({id:adventureID, time: Date.now() });
            this._lastAdventures[adventureID] = adventure;

        } else {
            this._queueAdventures.push({id:adventureID, time: Date.now() });
            this._lastAdventures[adventureID] = adventure;
        }

        // Cria um timer para chamar a função de auto remove em N minutos ( N * 60000 milisegundos )
        if ( this._autoRemoveIsActive == false ){
            this._autoRemoveIsActive = true;
            setTimeout(this.autoRemove, this._timeToCallAutoRemove * 60 * 1000);
        }
    }

    update( adventureID, adventure ){
        if ( this._lastAdventures[adventureID] === undefined ){
            return null;
        }

        this._lastAdventures[adventureID] = adventure;
    }

    delete(adventureID){
        if ( this._lastAdventures[adventureID] === undefined ){
            return null;
        }

        this._queueAdventures = this._queueAdventures.filter(item => item.id !== adventureID);

        delete this._lastAdventures[adventureID];

    }



}