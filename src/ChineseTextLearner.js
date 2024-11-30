import React, { useState, useEffect } from 'react';
import characterData from './data/checkpoint.json';
import { sampleTexts } from './sampleTexts';

const ChineseTextLearner = () => {
  const [currentTitle, setCurrentTitle] = useState('Sample Story');
  const [story, setStory] = useState(sampleTexts[0].text);
  
  // State to track current character and analysis
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentChar, setCurrentChar] = useState('');
  const [charDetails, setCharDetails] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translation, setTranslation] = useState('');
 
    
    // Function to fetch translation
    const translateText = async () => {
      try {
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=${encodeURIComponent(story)}`
        );
        const data = await response.json();
        const translatedText = data[0].map(x => x[0]).join('');
        setTranslation(translatedText);
        setShowTranslation(true);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslation('Translation failed. Please try again.');
      }
    };

  // Function to check if a character is a space or punctuation mark
  const isSkippableChar = (char) => {
    const punctuationMarks = ['。', '，' , '？', '！', '：', '；', '"', '"', '\'', '\''];
    return char.trim() === '' || punctuationMarks.includes(char);
  };
    
  const loadRandomText = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setStory(sampleTexts[randomIndex].text);
    setCurrentTitle(sampleTexts[randomIndex].title);
    // Reset the current character to the beginning
    const first = findNextChar(-1);
    if (first) {
      setCurrentIndex(first.index);
      setCurrentChar(first.char);
      setCharDetails(getCharacterDetails(first.char));
    }
  };    

  // Function to speak the character
  const speakCharacter = (char) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(char);
    
    // Try to set a Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(
      voice => voice.lang === 'zh-CN' || voice.lang.startsWith('zh')
    );

    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    // Set additional parameters
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8; // Slower speech for learning
    utterance.pitch = 1.0;

    // Speak the character
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported');
  }
};

  // Simulated dictionary and context explanation function
  const getCharacterDetails = (char) => {
    // Skip punctuation and spaces
    if (isSkippableChar(char)) {
      return null;
    }

    const details = characterData[char];
    return details || {
      pinyin: 'Unknown',
      meaning: 'Character not found',
      context: 'No additional information available.'
    };
  };

  // Find next non-skippable character
  const findNextChar = (startIndex) => {
    for (let i = startIndex + 1; i < story.length; i++) {
      if (!isSkippableChar(story[i])) {
        return { index: i, char: story[i] };
      }
    }
    return null;
  };

  // Find previous non-skippable character
  const findPrevChar = (startIndex) => {
    for (let i = startIndex - 1; i >= 0; i--) {
      if (!isSkippableChar(story[i])) {
        return { index: i, char: story[i] };
      }
    }
    return null;
  };

  // Move to next character
  const nextCharacter = () => {
    const next = findNextChar(currentIndex);
    if (next) {
      setCurrentIndex(next.index);
      setCurrentChar(next.char);
      setCharDetails(getCharacterDetails(next.char));
      speakCharacter(next.char);
    } else {
      // If at the end, restart from the beginning
      const first = findNextChar(-1);
      if (first) {
        setCurrentIndex(first.index);
        setCurrentChar(first.char);
        setCharDetails(getCharacterDetails(first.char));
        speakCharacter(first.char);
      }
    }
  };

  // Move to previous character
  const prevCharacter = () => {
    const prev = findPrevChar(currentIndex);
    if (prev) {
      setCurrentIndex(prev.index);
      setCurrentChar(prev.char);
      setCharDetails(getCharacterDetails(prev.char));
      speakCharacter(prev.char);
    }
  };

  // Start from the beginning
  const startLearning = () => {
    const first = findNextChar(-1);
    if (first) {
      setCurrentIndex(first.index);
      setCurrentChar(first.char);
      setCharDetails(getCharacterDetails(first.char));
      speakCharacter(first.char);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    if (story.length > 0) {
      const first = findNextChar(-1);
      if (first) {
        setCurrentIndex(first.index);
        setCurrentChar(first.char);
        setCharDetails(getCharacterDetails(first.char));
      }
    }
  }, [story]);

  // Render story with highlighted current character
  const renderStory = () => {
    return story.split('').map((char, index) => (
      <span 
        key={index} 
        className={`inline-block ${index === currentIndex ? 'text-red-600 font-bold' : ''} ${isSkippableChar(char) ? 'text-gray-400' : ''}`}
        onClick={() => {
          // If not a skippable character, select it
          if (!isSkippableChar(char)) {
            setCurrentIndex(index);
            setCurrentChar(char);
            setCharDetails(getCharacterDetails(char));
            speakCharacter(char);
          }
        }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div className="container mx-auto p-4 max-w-xl" translate="no" data-notranslate>
      <div className="border rounded shadow">
        <div className="border-b p-2">
          <h2 className="text-xl font-bold text-center">Chinese Text Learning</h2>
          <h3 className="text-md text-center text-gray-600">{currentTitle}</h3>
        </div>
        <div className="p-4">
          

          {/* Full Story Display */}
          <div className="text-lg mb-4 text-center cursor-pointer" translate="no" data-notranslate>
            <p>{renderStory()}</p>
          </div>

          {/* Rest of your existing JSX */}
          <div className="flex flex-col items-center">
            {/* Current Character Display */}
            <div 
              className="text-8xl font-bold mb-4 text-center select-none cursor-pointer text-red-600"
              onClick={() => speakCharacter(currentChar)}
              translate="no"
              data-notranslate
            >
              {currentChar}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-center space-x-4 mb-4">
              <button 
                onClick={prevCharacter} 
                className="px-4 py-2 border rounded disabled:opacity-50"
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              <button 
                onClick={startLearning}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Start
              </button>
              <button 
                onClick={() => speakCharacter(currentChar)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Speak
              </button>
              <button 
                onClick={nextCharacter} 
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {/* Character Details */}
            {charDetails && (
              <div className="text-center mb-4 space-y-2 w-full">
                <p className="text-2xl font-semibold">
                  Pinyin: {charDetails.pinyin}
                </p>
                <p className="text-xl">
                  Meaning: {charDetails.meaning}
                </p>
                {charDetails.context && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="italic">
                      Context: {charDetails.context}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Story Input */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span>Add Chinese Text here:</span>
              <button 
                onClick={loadRandomText}
                className="px-4 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Load Random Text
              </button>
            </div>
            <textarea 
              className="w-full p-2 border rounded"
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Paste a Chinese story here"
              translate="no"
              data-notranslate
            />
          </div>

        <div className="mb-4">
          <button
            onClick={() => {
              if (showTranslation) {
                // If translation is already shown, just hide it
                setShowTranslation(false);
              } else {
                // Otherwise, fetch the translation
                translateText();
              }
            }}
            className="w-full px-4 py-2 border text-black rounded hover:bg-blue-600"
          >
            {showTranslation ? 'Hide Translation' : 'Show Translation'}
          </button>
          {showTranslation && (
            <div className="mt-2 p-3 bg-gray-100 rounded">
              <p className="text-gray-700 italic">{translation}</p>
            </div>
          )}
        </div>


        </div>
      </div>
    </div>
  );
};
export default ChineseTextLearner;