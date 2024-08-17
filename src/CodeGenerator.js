import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './CodeGenerator.css';
import pinoutImage from './images/pinout.png';
import mascotImage from './images/mascot.webp';
import ledImage from './images/led.webp';
import buttonImage from './images/button.webp';
import servoImage from './images/servo.webp';
import stepperImage from './images/stepper.webp';
import delayImage from './images/delay.webp';
import toggleImage from './images/toggle.webp';
import controlImage from './images/control.webp';

const components = [
  { 
    id: 'led', 
    name: 'Magic Light', 
    icon: <img src={ledImage} alt="LED" width={80} height={80} />,
    info: "A tiny light that glows when electricity flows through it. It shows when something is working!"
  },
  { 
    id: 'button', 
    name: 'Clicky Switch', 
    icon: <img src={buttonImage} alt="Button" width={80} height={80} />,
    info: "A button you can press to make things happen in your circuit. It's like magic!"
  },
  { 
    id: 'servo', 
    name: 'Robotic Arm', 
    icon: <img src={servoImage} alt="Servo" width={80} height={80} />,
    info: "A motor that can turn to exact positions. It's like a robot arm that can point in different directions!"
  },
  { 
    id: 'stepper', 
    name: 'Step-by-Step Motor', 
    icon: <img src={stepperImage} alt="Stepper" width={80} height={80} />,
    info: "A motor that moves in tiny, precise steps. It's great for making things move very accurately!"
  },
  {
    id: 'delay',
    name: 'Wait Time',
    icon: <img src={delayImage} alt="Delay" width={80} height={80} />,
    info: "This tells your circuit to take a short break before doing the next thing. Like counting to 10 before you go!"
  },
  {
    id: 'toggle',
    name: 'Blinky Switch',
    icon: <img src={toggleImage} alt="Toggle/Blink" width={80} height={80} />,
    info: "This makes things turn on and off repeatedly. It's how you make lights blink!"
  },
  {
    id: 'control',
    name: 'Power Controller',
    icon: <img src={controlImage} alt="Control" width={80} height={80} />,
    info: "This lets you turn things on or off in your circuit. It's like a light switch for your components!"
  }
];

const availablePins = ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'];

const PinSelector = ({ selectedPin, onPinChange, usedPins, componentId }) => {
  return (
    <select 
      value={selectedPin} 
      onChange={(e) => onPinChange(e.target.value)}
      className="pin-selector"
      aria-label="Select a pin"
    >
      <option value="">Select a magic pin</option>
      {availablePins.map(pin => (
        <option 
          key={pin} 
          value={pin} 
          disabled={componentId !== 'control' && usedPins.includes(pin)}
        >
          {pin}
        </option>
      ))}
    </select>
  );
};

const StepperPinSelector = ({ selectedPins, onPinChange, usedPins }) => {
  return (
    <div className="stepper-pin-selector">
      {availablePins.map(pin => (
        <label key={pin} className="pin-checkbox-label">
          <input 
            type="checkbox"
            value={pin}
            checked={selectedPins.includes(pin)}
            onChange={(e) => {
              const newPins = e.target.checked 
                ? [...selectedPins, pin] 
                : selectedPins.filter(p => p !== pin);
              onPinChange(newPins);
            }}
            //disabled={usedPins.includes(pin) && !selectedPins.includes(pin)}
          />
          {pin}
        </label>
      ))}
    </div>
  );
};

const CodeGenerator = () => {
  const [circuit, setCircuit] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [score, setScore] = useState(0);
  const [mascotMessage, setMascotMessage] = useState("Let's build a cool circuit!");

  const showFeedback = (message) => {
    setFeedbackMessage(message);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 3000);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(circuit);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCircuit(items);
    setScore(score + 5);
    showFeedback(`Component moved! You earned 5 points!`);
  };

  const addComponent = (component) => {
    const newComponent = { 
      ...component, 
      pin: '',
      pins: [],
      value: component.id === 'servo' ? 90 : (component.id === 'stepper' ? 200 : 0),
      delayTime: 1000,
      toggleInterval: 1000,
      controlState: 'HIGH'
    };
    setCircuit([...circuit, newComponent]);
    setScore(score + 10);
    showFeedback(`${component.name} added to your awesome circuit! You earned 10 points!`);
    setMascotMessage(`Great job adding the ${component.name}! What should we add next?`);
  };

  const removeComponent = (index) => {
    const newCircuit = [...circuit];
    const removedComponent = newCircuit.splice(index, 1)[0];
    setCircuit(newCircuit);
    showFeedback(`${removedComponent.name} removed from the circuit. Keep experimenting!`);
    setMascotMessage(`Oops! We removed the ${removedComponent.name}. What else can we try?`);
  };

  const updateComponentValue = (index, value) => {
    const newCircuit = [...circuit];
    newCircuit[index].value = value;
    setCircuit(newCircuit);
    showFeedback(`You adjusted the ${newCircuit[index].name}. Great tinkering!`);
  };

  const updateComponentPin = (index, pin) => {
    const newCircuit = [...circuit];
    newCircuit[index].pin = pin;
    setCircuit(newCircuit);
    showFeedback(`Magic Pin ${pin} selected for ${newCircuit[index].name}. Good choice!`);
  };

  const updateStepperPins = (index, pins) => {
    const newCircuit = [...circuit];
    newCircuit[index].pins = pins;
    setCircuit(newCircuit);
    showFeedback(`You connected the Step-by-Step Motor to pins ${pins.join(', ')}. Awesome!`);
  };

  const updateControlState = (index, state) => {
    const newCircuit = [...circuit];
    newCircuit[index].controlState = state;
    setCircuit(newCircuit);
    showFeedback(`Power Controller set to ${state}. You're becoming a circuit master!`);
  };
  const generateCode = useCallback(() => {
    let code = `#include <Servo.h>\n#include <Stepper.h>\n\n`;
    let setupCode = `void setup() {\n  // Setup code for initializing components\n`;
    let loopCode = `void loop() {\n  // The main loop runs over and over again\n`;
    
    const servoMap = new Map(); // To keep track of servos and their pins
    const initializedPins = new Set(); // To keep track of initialized pins
    const stepperMap = new Map(); // To keep track of stepper motors and their pins
  
    circuit.forEach((component, index) => {
      if (!component.pin && component.id !== 'delay' && component.id !== 'stepper') return;
  
      switch (component.id) {
        case 'led':
          if (!initializedPins.has(component.pin)) {
            setupCode += `  pinMode(${component.pin}, OUTPUT); // Setup Magic Light pin\n`;
            initializedPins.add(component.pin);
          }
          loopCode += `  digitalWrite(${component.pin}, ${component.value ? 'HIGH' : 'LOW'}); // Turn Magic Light ${component.value ? 'on' : 'off'}\n`;
          break;
        case 'button':
          if (!initializedPins.has(component.pin)) {
            setupCode += `  pinMode(${component.pin}, INPUT_PULLUP); // Setup Clicky Switch pin\n`;
            initializedPins.add(component.pin);
          }
          loopCode += `  if (digitalRead(${component.pin}) == LOW) {\n    // Clicky Switch pressed\n    // Add your magic code here\n  }\n`;
          break;
        case 'servo':
          if (!servoMap.has(component.pin)) {
            const servoName = `myRoboticArm${servoMap.size + 1}`;
            code += `Servo ${servoName};\n`;
            setupCode += `  ${servoName}.attach(${component.pin}); // Attach Robotic Arm to pin\n`;
            servoMap.set(component.pin, servoName);
          }
          loopCode += `  ${servoMap.get(component.pin)}.write(${component.value}); // Move Robotic Arm to ${component.value} degrees\n`;
          break;
        case 'stepper':
          if (component.pins.length === 4) {
            const pinKey = component.pins.join(',');
            let stepperName;
            if (!stepperMap.has(pinKey)) {
              stepperName = `myStepByStepMotor${stepperMap.size + 1}`;
              code += `Stepper ${stepperName}(200, ${component.pins.join(', ')});\n`;
              setupCode += `  ${stepperName}.setSpeed(60); // Set Step-by-Step Motor speed\n`;
              stepperMap.set(pinKey, stepperName);
            } else {
              stepperName = stepperMap.get(pinKey);
            }
            loopCode += `  ${stepperName}.step(${component.value}); // Move Step-by-Step Motor by ${component.value} steps\n`;
          }
          break;
        case 'delay':
          loopCode += `  delay(${component.value}); // Wait for ${component.value} milliseconds\n`;
          break;
        case 'toggle':
          if (!initializedPins.has(component.pin)) {
            setupCode += `  pinMode(${component.pin}, OUTPUT); // Setup Blinky Switch pin\n`;
            initializedPins.add(component.pin);
          }
          loopCode += `  digitalWrite(${component.pin}, HIGH); // Turn Blinky Switch on\n`;
          loopCode += `  delay(${component.toggleInterval}); // Wait for ${component.toggleInterval} ms\n`;
          loopCode += `  digitalWrite(${component.pin}, LOW); // Turn Blinky Switch off\n`;
          loopCode += `  delay(${component.toggleInterval}); // Wait for ${component.toggleInterval} ms\n`;
          break;
        case 'control':
          if (!initializedPins.has(component.pin)) {
            setupCode += `  pinMode(${component.pin}, OUTPUT); // Setup Power Controller pin\n`;
            initializedPins.add(component.pin);
          }
          loopCode += `  digitalWrite(${component.pin}, ${component.controlState}); // Set Power Controller to ${component.controlState}\n`;
          break;
        default:
          break;
      }
    });
    
    setupCode += `}\n\n`;
    loopCode += `}\n`;
    
    return code + setupCode + loopCode;
  }, [circuit]);
  useEffect(() => {
    const code = generateCode();
    setGeneratedCode(code);
  }, [circuit, generateCode]);

  const usedPins = circuit.flatMap(component => component.pins || [component.pin]);

  return (
<div className="vertical-split-screen">
      <div className="left-panel">
        <div className="header-section">
          <h1 className="text-3xl font-bold mb-4 text-center text-primary">Circuit Wizard's Workshop</h1>
          <div className="mascot-guide">
            <img src={mascotImage} alt="Mascot" className="mascot-image" />
            <div className="mascot-bubble">{mascotMessage}</div>
          </div>
        </div>
        <div className="score-display">Magic Points: {score}</div>
        <div className="pinout-container">
          <img src={pinoutImage} alt="ESP8622 Pinout" className="pinout-image" />
        </div>
        <div className="component-list-horizontal">
          {components.map((component) => (
            <div key={component.id} className="component-item-horizontal">
              <button
                className="component-button-horizontal tooltip"
                onClick={() => addComponent(component)}
                aria-label={`Add ${component.name}`}
              >
                {component.icon}
                <span className="tooltiptext">{component.info}</span>
              </button>
              <p className="component-name">{component.name}</p>
            </div>
          ))}
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="circuit">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="circuit-container"
              >
                <h2 className="text-2xl font-bold mb-4">Your Magical Circuit</h2>
                {circuit.map((item, index) => (
                  <Draggable key={index} draggableId={`${item.id}-${index}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="circuit-item animated-item"
                        tabIndex={0}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                          {item.id === 'stepper' ? (
                            <StepperPinSelector
                              selectedPins={item.pins}
                              onPinChange={(pins) => updateStepperPins(index, pins)}
                              usedPins={usedPins}
                            />
                          ) : item.id !== 'delay' && (
                            <PinSelector
                              selectedPin={item.pin}
                              onPinChange={(pin) => updateComponentPin(index, pin)}
                              usedPins={usedPins}
                              componentId={item.id}
                            />
                          )}
                          {item.id === 'servo' && (
                            <div className="flex items-center ml-4">
                              <input
                                type="range"
                                min={0}
                                max={180}
                                value={item.value}
                                onChange={(e) => updateComponentValue(index, parseInt(e.target.value))}
                                className="horizontal-slider"
                                aria-label="Robotic Arm angle"
                              />
                              <span className="slider-value ml-2">
                                {item.value}°
                              </span>
                            </div>
                          )}
                          {item.id === 'stepper' && (
                            <div className="flex items-center ml-4">
                              <input
                                type="range"
                                min={0}
                                max={400}
                                value={item.value}
                                onChange={(e) => updateComponentValue(index, parseInt(e.target.value))}
                                className="horizontal-slider"
                                aria-label="Step-by-Step Motor steps"
                              />
                              <span className="slider-value ml-2">
                                {item.value} steps
                              </span>
                            </div>
                          )}
{item.id === 'delay' && (
                            <div className="flex items-center ml-4">
                              <input
                                type="range"
                                min={100}
                                max={5000}
                                value={item.value}
                                onChange={(e) => updateComponentValue(index, parseInt(e.target.value))}
                                className="horizontal-slider"
                                aria-label="Wait Time"
                              />
                              <span className="slider-value ml-2">
                                {item.value} ms
                              </span>
                            </div>
                          )}
                          {item.id === 'control' && (
                            <>
                              <PinSelector
                                selectedPin={item.pin}
                                onPinChange={(pin) => updateComponentPin(index, pin)}
                                usedPins={usedPins}
                                componentId={item.id}
                              />
                              <select
                                value={item.controlState}
                                onChange={(e) => updateControlState(index, e.target.value)}
                                className="control-state-selector"
                                aria-label="Select power state"
                              >
                                <option value="HIGH">ON</option>
                                <option value="LOW">OFF</option>
                              </select>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => removeComponent(index)}
                          className="remove-button ml-2"
                          aria-label="Remove component"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {feedbackMessage && (
          <div className="feedback-message">
            {feedbackMessage}
          </div>
        )}
      </div>

      <div className="right-panel">
        <h2 className="text-2xl font-bold mb-4">Your Magic Spell (Code)</h2>
        <pre className="code-display">
          <code>{generatedCode || 'Your special code will appear here...'}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeGenerator;