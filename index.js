
class Minion {

    constructor() {
        const prototype = this.constructor.prototype;
        const workerBody = [
            'var minion = { worker : true'
        ];

        for(let method of Object.getOwnPropertyNames(prototype)) {
            if(typeof(this[method]) !== 'function'
                || ['constructor', 'onAnswer'].includes(method)
            ) {
                continue;
            }

            workerBody.push(', ');
            workerBody.push(methodDeclaration(method, prototype));
        }

        workerBody.push("};\n");
        workerBody.push("\nself.addEventListener('message', function(e){minion.onMessage(e.data)});");
        workerBody.push("\nminion.execute();");

        const blobURL = URL.createObjectURL(
            new Blob(workerBody, { type: 'application/javascript' })
        );

        this.worker = new Worker(blobURL);
        this.worker.addEventListener('message', (e) => {
            this.onAnswer(e.data)
        });
        URL.revokeObjectURL(blobURL);
    }

    onMessage(message) {
        this.postMessage(message);
    }

    onAnswer(message) {
        console.log('received', message);
    }

    execute() {}

    postMessage(message) {
        if(this.worker === true) {
            self.postMessage(message);
        } else {
            this.worker.postMessage(message);
        }

    }
}

export default Minion;

function methodDeclaration(method, object) {
    return `${method} : ${object[method].toString()}`;
}
