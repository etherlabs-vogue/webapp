import express, { Express, Request, Response } from 'express';
import { platform } from 'os';
import * as WebSocket from 'ws';
import expressWs from 'express-ws';
import * as http from 'http';
import { IDisposable, IPty, spawn } from 'node-pty';
import path from 'path';
import cors from 'cors'
const USE_BINARY = platform() !== "win32";


var terminals:{[key:string]:IPty} = {},
unsentOutput:{[key:string]:string} = {},
temporaryDisposable:{[key:string]:IDisposable} = {};

const expressApp: Express = express();
const { app, } = expressWs(expressApp)

const shell = process.env[platform() === 'win32' ? 'COMSPEC' : 'SHELL']

// app.use(cors())
app.use(express.static(__dirname + '/client'));
// Handle client routing, return all requests to the app
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'client/index.html'));
  });
app.post('/terminals', (req, res) => {
  try{

  
  const {cols,rows}= req.query
  const env = Object.assign({}, process.env);

    
  var term = spawn(process.platform === 'win32' ? 'pwsh.exe' : 'bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    //@ts-expect-error
    env: process.env
    });

  console.log('Created terminal with PID: ' + term.pid);
  terminals[term.pid] = term
  unsentOutput[term.pid] = '';
  
    temporaryDisposable[term.pid] = term.onData(function(data) {
      unsentOutput[term.pid] += data;
    });
  res.json({pid:term.pid.toString()})
}
  catch{

  }
});
app.ws('/terminals', (ws,req)=>{
  process.env['COLORTERM'] ='truecolor';
  var term = spawn(process.platform === 'win32' ? 'pwsh.exe' : 'bash', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd:'/',
    //@ts-expect-error
    env: process.env
    });
    unsentOutput[term.pid] = '';
  
    temporaryDisposable[term.pid] = term.onData(function(data) {
      unsentOutput[term.pid] += data;
    });
  console.log('👨‍💻 [connect]: Connected to terminal ' + term.pid);
  temporaryDisposable[term.pid].dispose();
  delete temporaryDisposable[term.pid];
    ws.send(unsentOutput[term.pid]);
    delete unsentOutput[term.pid];
  // unbuffered delivery after user input
  let userInput = false;

  // binary message buffering
  function bufferUtf8(socket:WebSocket, timeout:number, maxSize:number) {

    const chunks: any[]= [];
    let length = 0;
    let sender:any = null;
    return (data: string | Buffer |any[]) => {

      chunks.push(data);
      length += data.length;
      if (length > maxSize || userInput) {
        userInput = false;
        socket.send(Buffer.concat(chunks));
        chunks.length = 0;
        length = 0;
        if (sender) {
          clearTimeout(sender);
          sender = null;
        }
      } else if (!sender) {
         sender = setTimeout(() => {
          socket.send(Buffer.concat(chunks));
          chunks.length = 0;
          length = 0;
          sender = null;
        }, timeout);
      }
    };
  }
  const send = bufferUtf8(ws, 3, 262144);

  // WARNING: This is a naive implementation that will not throttle the flow of data. This means
  // it could flood the communication channel and make the terminal unresponsive. Learn more about
  // the problem and how to implement flow control at https://xtermjs.org/docs/guides/flowcontrol/
  term.onData(function(data) {
    try {
      send(Buffer.from(data, "utf-8"));
    } catch (ex) {
      // The WebSocket is not open, ignore
    }
  });
  ws.on('message', function(msg:WebSocket.RawData) {

    term.write(msg.toString());
    userInput = true;
  });
  ws.on('close', function () {
    term.kill();
    console.log('Closed terminal ' + term.pid);
    // Clean things up
    delete terminals[term.pid];
  });
})
app.listen(3001, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${3001}`);
  console.log(`🖥️  [  os  ]: Running on ${platform()}`)
  console.log(`🏃 [running]: Running terminals: ${Object.entries(terminals)}`)
});