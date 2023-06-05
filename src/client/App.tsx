
import {Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import {AttachAddon}  from 'xterm-addon-attach'
import { FitAddon } from "xterm-addon-fit";
const xtermjsTheme = {
    foreground: '#F8F8F8',
    background: '#2D2E2C',
    selectionBackground: '#5DA5D533',
    black: '#1E1E1D',
    brightBlack: '#262625',
    red: '#CE5C5C',
    brightRed: '#FF7272',
    green: '#5BCC5B',
    brightGreen: '#72FF72',
    yellow: '#CCCC5B',
    brightYellow: '#FFFF72',
    blue: '#5D5DD3',
    brightBlue: '#7279FF',
    magenta: '#BC5ED1',
    brightMagenta: '#E572FF',
    cyan: '#5DA5D5',
    brightCyan: '#72F0FF',
    white: '#F8F8F8',
    brightWhite: '#FFFFFF'
  };
import './App.css'
import { useEffect, useRef } from 'react';

function App() {


  const ref= useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal>();

  // useEffect(() => {
  //     if(container && ws){
        
        
  //       var attach = new AttachAddon(ws)
  //       //@ts-expect-error
  //       ws.onopen = term.loadAddon(attach)
       
  //     }
  //   // return () => {
  //   //   ws.close()

  //   // }
  // }, [ws])

  const socket = new WebSocket('ws://localhost:3001/terminals')
  useEffect(() => {

    
    if(ref.current && socket){
      const xterm = (xtermRef.current = new Terminal({theme:xtermjsTheme}));
      // const ws = new WebSocket('ws://localhost:3000/terminals')
      var attach = new AttachAddon(socket)
      // @ts-expect-error
      socket.onopen = xterm.loadAddon(attach)
      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);
      xterm.open(ref.current);
      fitAddon.fit();
    }
  
    return () => {
    //  socket.close() 
     
    }
  }, [])
  

  return (
    <>
      <div className='flex flex-col lg:flex-row gap-8 p-10 h-screen flex-1'>
        <div className='flex-1 flex flex-col bg-white mb-[1.1rem] border rounded-lg ' >
          <section className='flex-1 p-5'>

          <h1 className='font-black text-3xl text-black'>Welcome to &quot;S3&quot; LAB</h1>
          </section>
          <section className='border-t h-24 flex px-8'>
            <div className='flex-1'></div>
            <div className=' flex flex-row justify-center items-center gap-4 '>
            <button className=' px-3 py-2 rounded text-md font-bold bg-gray-300 text-gray-900'>&larr; Back</button>
            <button className=' px-3 py-2 rounded textmd font-bold bg-teal-500 text-white'>Next &rarr;</button>
            </div>
          </section>
        </div>
        <div ref={ref} className='flex-1 border border-white w-'>
          
        </div>
      </div>
    </>
  )
}

export default App
