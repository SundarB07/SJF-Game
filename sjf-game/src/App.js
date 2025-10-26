import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [processes, setProcesses] = useState([]);
  const [cpuQueue, setCpuQueue] = useState([]);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [buttonColor, setButtonColor] = useState({ check: "#6a11cb", reset: "#2575fc" });

  useEffect(() => {
    resetGame();
  }, []);

  function generateProcesses() {
    const count = Math.floor(Math.random() * 5) + 3; // 3–7 processes
    const arr = [];
    const colors = ["#ff4e50","#00c6ff","#f7971e","#6a11cb","#ff416c","#00ffb0","#ff9a9e"];
    for (let i = 1; i <= count; i++) {
      arr.push({
        id: `P${i}`,
        burst: Math.floor(Math.random() * 10) + 1,
        arrival: Math.floor(Math.random() * 6),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return arr.sort(() => Math.random() - 0.5);
  }

  function handleDragStart(e, process) {
    e.dataTransfer.setData("processId", process.id);
  }

  function handleDrop(e) {
    e.preventDefault();
    if (completed) return;
    const id = e.dataTransfer.getData("processId");
    const proc = processes.find(p => p.id === id);
    if (proc && !cpuQueue.includes(proc)) {
      setCpuQueue([...cpuQueue, proc]);
    }
  }

  function handleDragOver(e) { e.preventDefault(); }

  function handleCpuDragStart(e, index) { setDraggedIndex(index); }

  function handleCpuDrop(e, dropIndex) {
    e.preventDefault();
    if (draggedIndex === null || completed) return;
    const newQueue = [...cpuQueue];
    const [moved] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(dropIndex, 0, moved);
    setCpuQueue(newQueue);
    setDraggedIndex(null);
  }

  function checkOrder() {
    setCompleted(true);
    const correctOrder = [...processes]
      .sort((a,b) => a.burst===b.burst ? a.arrival-b.arrival : a.burst-b.burst)
      .map(p=>p.id);
    const userOrder = cpuQueue.map(p=>p.id);

    if(JSON.stringify(userOrder)===JSON.stringify(correctOrder)){
      setMessage("🎉 You Won! CPU executed efficiently!");
      setResult("win");
    } else {
      setMessage(`❌ You Lost! Correct order: ${correctOrder.join(" → ")}`);
      setResult("lose");
    }
  }

  function resetGame() {
    const procs = generateProcesses();
    setProcesses(procs);
    setCpuQueue([]);
    setMessage("");
    setResult(null);
    setCompleted(false);
    setDraggedIndex(null);
    setButtonColor({ check: "#6a11cb", reset: "#2575fc" });
  }

  return (
    <div className="arena">
      <h1>CPU Execution Arena</h1>
      <p>Drag processes into the CPU lane in order of <b>Shortest Job First</b> (use Arrival Time if BT ties). Reorder inside CPU lane before clicking Completed.</p>

      <div className="process-line">
        <AnimatePresence>
          {processes.map((p,i)=>(
            <motion.div
              key={p.id}
              className="process"
              style={{ backgroundColor: p.color }}
              draggable={!completed}
              onDragStart={e=>handleDragStart(e,p)}
              initial={{ y:-50, opacity:0 }}
              animate={{ y:0, opacity:1 }}
              transition={{ delay: i*0.15, type:"spring", stiffness:120 }}
              whileHover={{ scale:1.1, boxShadow:"0 0 15px #fff" }}
              whileTap={{ scale:0.95, rotate:5 }}
            >
              {p.id} (BT: {p.burst}, AT: {p.arrival})
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className={`cpu-box ${result==="win"?"win":result==="lose"?"lose":""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        animate={{ boxShadow: result==="win"?"0 0 30px #00ff88": result==="lose"?"0 0 30px #ff3f3f": "0 0 20px #00fff7aa" }}
        transition={{ duration:0.3 }}
      >
        <h2>CPU Lane</h2>
        <div className="cpu-queue">
          <AnimatePresence>
            {cpuQueue.map((p,i)=>(
              <motion.div
                key={p.id}
                className="process cpu-process"
                style={{ backgroundColor: p.color }}
                draggable={!completed}
                onDragStart={e=>handleCpuDragStart(e,i)}
                onDrop={e=>handleCpuDrop(e,i)}
                onDragOver={e=>!completed&&e.preventDefault()}
                initial={{ x:-300, opacity:0 }}
                animate={{ x:0, opacity:1 }}
                exit={{ opacity:0 }}
                transition={{ delay:i*0.15, type:"spring", stiffness:150 }}
              >
                <span>{p.id} (BT: {p.burst}, AT: {p.arrival})</span>
                <motion.div className="progress-bar"
                  initial={{ width:0 }}
                  animate={{ width:`${p.burst*10}%` }}
                  transition={{ delay:i*0.15, duration:0.5 }}
                >
                  <div className="progress-fill"></div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {message && <div className="message">{message}</div>}

      <div className="buttons">
        <button className="check-btn" style={{backgroundColor: buttonColor.check}} onClick={checkOrder}>Completed</button>
        <button className="reset-btn" style={{backgroundColor: buttonColor.reset}} onClick={resetGame}>Reset Game</button>
      </div>
    </div>
  );
}

export default App;
