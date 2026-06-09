import { useState, useRef, useEffect } from 'react';
import { startRecognition, stopRecognition, isRecognitionSupported } from '@/services/recognitionService';
import { validateAnswer } from '@/services/dictionaryService';
import { playPoint } from '@/services/soundService';
import type { CategoryKey } from '@/types';
import './AnswerInput.css';

interface AnswerInputProps {
  currentLetter: string;
  currentCategory: CategoryKey;
  onValidAnswer: () => void;
}

type Status = 'idle' | 'listening' | 'checking' | 'valid' | 'invalid';

export function AnswerInput({ currentLetter, currentCategory, onValidAnswer }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const validatedRef = useRef(false);

  useEffect(() => {
    setAnswer('');
    setStatus('idle');
    setFeedback('');
    validatedRef.current = false;
  }, [currentLetter, currentCategory]);

  async function handleValidate(word: string) {
    const trimmed = word.trim();
    if (!trimmed || validatedRef.current || status === 'checking') return;

    setStatus('checking');
    setFeedback('A verificar…');

    const result = await validateAnswer(trimmed, currentLetter, currentCategory);

    if (result.valid) {
      setStatus('valid');
      setFeedback(`✓ ${result.reason}`);
      if (!validatedRef.current) {
        validatedRef.current = true;
        playPoint();
        onValidAnswer();
      }
    } else {
      setStatus('invalid');
      setFeedback(`✗ ${result.reason}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleValidate(answer);
  }

  function handleMic() {
    if (listening) {
      stopRecognition();
      setListening(false);
      setStatus('idle');
      setFeedback('');
      return;
    }

    setListening(true);
    setStatus('listening');
    setFeedback('A ouvir… fala agora!');
    setAnswer('');

    startRecognition(
      (transcript, isFinal) => {
        setAnswer(transcript);
        if (isFinal) {
          setListening(false);
          void handleValidate(transcript);
        }
      },
      (error) => {
        setListening(false);
        setStatus('idle');
        setFeedback(error === 'no-speech' ? 'Não ouvi nada. Tenta de novo.' : 'Erro no microfone.');
      },
      () => setListening(false)
    );
  }

  const statusClass = {
    valid: 'answer-valid',
    invalid: 'answer-invalid',
    listening: 'answer-listening',
    checking: 'answer-checking',
    idle: '',
  }[status];

  const feedbackClass = {
    valid: 'feedback-ok',
    invalid: 'feedback-err',
    listening: 'feedback-info',
    checking: 'feedback-info',
    idle: '',
  }[status];

  return (
    <div className={`answer-input-wrapper ${statusClass}`}>
      <div className="answer-input-row">
        <input
          className="answer-input"
          type="text"
          value={answer}
          onChange={e => {
            setAnswer(e.target.value);
            if (status !== 'idle') { setStatus('idle'); setFeedback(''); }
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Palavra com ${currentLetter.toUpperCase()}…`}
          maxLength={40}
          disabled={listening || status === 'checking' || status === 'valid'}
          autoComplete="off"
          autoCapitalize="none"
        />

        {isRecognitionSupported() && (
          <button
            className={`mic-btn ${listening ? 'mic-active' : ''}`}
            onClick={handleMic}
            disabled={status === 'checking' || status === 'valid'}
            aria-label={listening ? 'Parar' : 'Microfone'}
          >
            {listening ? '⏹' : '🎤'}
          </button>
        )}

        <button
          className="submit-btn"
          onClick={() => void handleValidate(answer)}
          disabled={answer.trim().length === 0 || listening || status === 'checking' || status === 'valid'}
          aria-label="Validar"
        >
          {status === 'checking' ? '…' : '✓'}
        </button>
      </div>

      {feedback && (
        <div className={`answer-feedback ${feedbackClass}`}>
          {status === 'checking' && <span className="checking-spinner" />}
          {feedback}
        </div>
      )}
    </div>
  );
}
