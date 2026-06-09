import { useState, useRef, useEffect } from 'react';
import { startRecognition, stopRecognition, isRecognitionSupported } from '@/services/recognitionService';
import { validateWord, startsWithLetter } from '@/services/dictionaryService';
import { playPoint } from '@/services/soundService';
import './AnswerInput.css';

interface AnswerInputProps {
  currentLetter: string;
  onValidAnswer: () => void;
}

type Status = 'idle' | 'listening' | 'checking' | 'valid' | 'invalid' | 'wrong-letter';

export function AnswerInput({ currentLetter, onValidAnswer }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const validatedRef = useRef(false);

  useEffect(() => {
    setAnswer('');
    setStatus('idle');
    setFeedback('');
    validatedRef.current = false;
  }, [currentLetter]);

  async function handleValidate(word: string) {
    const trimmed = word.trim();
    if (!trimmed || validatedRef.current) return;

    // 1. Verificar letra
    if (!startsWithLetter(trimmed, currentLetter)) {
      setStatus('wrong-letter');
      setFeedback(`✗ "${trimmed}" não começa por ${currentLetter.toUpperCase()}.`);
      return;
    }

    // 2. Verificar no dicionário
    setStatus('checking');
    setFeedback('A verificar no dicionário…');

    const exists = await validateWord(trimmed);

    if (exists) {
      setStatus('valid');
      setFeedback(`✓ "${trimmed}" é válido!`);
      if (!validatedRef.current) {
        validatedRef.current = true;
        playPoint();
        onValidAnswer();
      }
    } else {
      setStatus('invalid');
      setFeedback(`✗ "${trimmed}" não foi encontrado no dicionário.`);
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
    'wrong-letter': 'answer-invalid',
    listening: 'answer-listening',
    checking: 'answer-checking',
    idle: '',
  }[status];

  const feedbackClass = {
    valid: 'feedback-ok',
    invalid: 'feedback-err',
    'wrong-letter': 'feedback-err',
    listening: 'feedback-info',
    checking: 'feedback-info',
    idle: '',
  }[status];

  return (
    <div className={`answer-input-wrapper ${statusClass}`}>
      <div className="answer-input-row">
        <input
          ref={inputRef}
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
          disabled={listening || status === 'checking'}
          autoComplete="off"
          autoCapitalize="none"
        />

        {isRecognitionSupported() && (
          <button
            className={`mic-btn ${listening ? 'mic-active' : ''}`}
            onClick={handleMic}
            disabled={status === 'checking'}
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
