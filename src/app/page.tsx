"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState<number>(0);
  const [previousOperator, setPreviousOperator] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [memoryStored, setMemoryStored] = useState<number | null>(null);
  const [expression, setExpression] = useState<string[]>([]);
  const [openParentheses, setOpenParentheses] = useState(0);

  const displayRef = useRef<HTMLDivElement>(null);

  const adjustFontSize = () => {
    if (displayRef.current) {
      const element = displayRef.current;
      const container = element.parentElement as HTMLElement;

      element.style.fontSize = '1.875rem';

      while (element.scrollWidth > container.clientWidth && parseFloat(getComputedStyle(element).fontSize) > 12) {
        const currentSize = parseFloat(getComputedStyle(element).fontSize);
        element.style.fontSize = `${currentSize - 1}px`;
      }
    }
  };

  useEffect(() => {
    adjustFontSize();
  }, [display]);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setExpression(prev => [...prev, num]);
      setNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
      if (display === "0") {
        setExpression(prev => [...prev.slice(0, -1), num]);
      } else {
        setExpression(prev => [...prev.slice(0, -1), prev[prev.length - 1] + num]);
      }
    }
  };

  const handleOperator = (operator: string) => {
    const current = parseFloat(display);
    setNewNumber(true);

    if (previousOperator) {
      calculate();
    } else {
      setMemory(current);
    }
    setPreviousOperator(operator);
    setExpression(prev => [...prev, operator]);
  };

  const calculate = () => {
    if (!previousOperator) return;

    const current = parseFloat(display);
    let result = memory;

    switch (previousOperator) {
      case "+":
        result += current;
        break;
      case "-":
        result -= current;
        break;
      case "×":
        result *= current;
        break;
      case "÷":
        if (current === 0) {
          setDisplay("Error");
          setExpression([]);
          return;
        }
        result /= current;
        break;
    }

    setMemory(result);
    setDisplay(result.toString());
    setPreviousOperator(null);
    setExpression(prev => [...prev.slice(0, -2), result.toString()]);
  };

  const handleScientific = (operation: string) => {
    const current = parseFloat(display);
    let result: number;

    try {
      switch (operation) {
        case "sin":
          result = Math.sin(current * Math.PI / 180);
          break;
        case "cos":
          result = Math.cos(current * Math.PI / 180);
          break;
        case "tan":
          if (Math.abs(current % 180) === 90) {
            throw new Error("Undefined");
          }
          result = Math.tan(current * Math.PI / 180);
          break;
        case "√":
          if (current < 0) {
            throw new Error("Invalid input");
          }
          result = Math.sqrt(current);
          break;
        case "x²":
          result = Math.pow(current, 2);
          break;
        case "log":
          if (current <= 0) {
            throw new Error("Invalid input");
          }
          result = Math.log10(current);
          break;
        case "ln":
          if (current <= 0) {
            throw new Error("Invalid input");
          }
          result = Math.log(current);
          break;
        case "!":
          if (current < 0 || !Number.isInteger(current)) {
            throw new Error("Invalid input");
          }
          result = factorial(current);
          break;
        case "1/x":
          if (current === 0) {
            throw new Error("Cannot divide by zero");
          }
          result = 1 / current;
          break;
        case "e^x":
          result = Math.exp(current);
          break;
        default:
          throw new Error("Invalid operation");
      }

      result = Number(result.toFixed(8));
      setDisplay(result.toString());
    } catch (error) {
      setDisplay(error instanceof Error ? error.message : "Error");
    }
    setNewNumber(true);
  };

  const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const handleMemory = (operation: string) => {
    const current = parseFloat(display);

    switch (operation) {
      case "M+":
        setMemoryStored((prev) => (prev ?? 0) + current);
        break;
      case "M-":
        setMemoryStored((prev) => (prev ?? 0) - current);
        break;
      case "MR":
        if (memoryStored !== null) {
          setDisplay(memoryStored.toString());
          setNewNumber(true);
        }
        break;
      case "MC":
        setMemoryStored(null);
        break;
    }
  };

  const handleParentheses = (type: "(" | ")") => {
    if (type === "(") {
      setOpenParentheses(prev => prev + 1);
      setExpression(prev => [...prev, "("]);
    } else if (type === ")" && openParentheses > 0) {
      setOpenParentheses(prev => prev - 1);
      setExpression(prev => [...prev, ")"]);
    }
  };

  const clear = () => {
    setDisplay("0");
    setMemory(0);
    setPreviousOperator(null);
    setNewNumber(true);
    setMemoryStored(null);
    setExpression([]);
    setOpenParentheses(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-[480px]">
        <div className="mb-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg relative">
            <div className="text-right font-mono text-sm text-gray-500 dark:text-gray-400 mb-1">
              {expression.join(' ')}
            </div>
            <div 
              ref={displayRef}
              className="calculator-display text-right font-mono dark:text-white whitespace-nowrap overflow-hidden"
            >
              {display}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {/* Memory Functions */}
          <button onClick={() => handleMemory("MC")} className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600">MC</button>
          <button onClick={() => handleMemory("MR")} className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600">MR</button>
          <button onClick={() => handleMemory("M-")} className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600">M-</button>
          <button onClick={() => handleMemory("M+")} className="p-3 bg-purple-500 text-white rounded hover:bg-purple-600">M+</button>
          <button onClick={clear} className="p-3 bg-red-500 text-white rounded hover:bg-red-600">C</button>

          {/* Advanced Functions */}
          <button onClick={() => handleScientific("log")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">log</button>
          <button onClick={() => handleScientific("ln")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">ln</button>
          <button onClick={() => handleScientific("e^x")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">e^x</button>
          <button onClick={() => handleScientific("!")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">n!</button>
          <button onClick={() => handleScientific("1/x")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">1/x</button>

          {/* Scientific Functions */}
          <button onClick={() => handleScientific("sin")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">sin</button>
          <button onClick={() => handleScientific("cos")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">cos</button>
          <button onClick={() => handleScientific("tan")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">tan</button>
          <button onClick={() => handleParentheses("(")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">(</button>
          <button onClick={() => handleParentheses(")")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">)</button>

          {/* Numbers and Basic Operations */}
          <button onClick={() => handleNumber("7")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">7</button>
          <button onClick={() => handleNumber("8")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">8</button>
          <button onClick={() => handleNumber("9")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">9</button>
          <button onClick={() => handleScientific("√")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">√</button>
          <button onClick={() => handleOperator("÷")} className="p-3 bg-orange-500 text-white rounded hover:bg-orange-600">÷</button>

          <button onClick={() => handleNumber("4")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">4</button>
          <button onClick={() => handleNumber("5")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">5</button>
          <button onClick={() => handleNumber("6")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">6</button>
          <button onClick={() => handleScientific("x²")} className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600">x²</button>
          <button onClick={() => handleOperator("×")} className="p-3 bg-orange-500 text-white rounded hover:bg-orange-600">×</button>

          <button onClick={() => handleNumber("1")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">1</button>
          <button onClick={() => handleNumber("2")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">2</button>
          <button onClick={() => handleNumber("3")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">3</button>
          <button onClick={calculate} className="p-3 bg-orange-500 text-white rounded hover:bg-orange-600 row-span-2">=</button>
          <button onClick={() => handleOperator("-")} className="p-3 bg-orange-500 text-white rounded hover:bg-orange-600">-</button>

          <button onClick={() => handleNumber("0")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white col-span-2">0</button>
          <button onClick={() => handleNumber(".")} className="p-3 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-white">.</button>
          <button onClick={() => handleOperator("+")} className="p-3 bg-orange-500 text-white rounded hover:bg-orange-600">+</button>
        </div>
      </div>
    </div>
  );
}
