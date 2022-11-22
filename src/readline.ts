import {createInterface,Interface} from 'node:readline';
import {EmptyTokenError} from './types'
import { stdin, stdout } from 'process';

export async function startREPL(func:(a:string) => string) {
    const rl = createInterface({
        input: stdin,
        output: stdout,
        prompt: 'tlisp> '
    });
    rl.prompt()
    rl.on('line',(line) => {
        try{
            console.log(func(line.trim()))
        }catch(e){
            /* Catch all :print stacktrace */
            if(!(e instanceof EmptyTokenError))
                console.log(e)
        }
        rl.prompt()
    }).on('close',()=>{console.log("goodbye")})

}

