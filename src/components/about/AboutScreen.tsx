import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import './AboutScreen.css';

const VERSION = '2.1.0';

const HOW_TO_PLAY_LOCAL = [
  { icon: '🎯', title: 'Objectivo', text: 'Dizer uma palavra válida para a letra e categoria sorteadas antes do tempo acabar.' },
  { icon: '🔤', title: 'Letra sorteada', text: 'Cada ronda sorteia uma letra aleatória do alfabeto. Todas as 23 letras são usadas ao longo do jogo.' },
  { icon: '📂', title: 'Categorias', text: 'Uma ou mais categorias são sorteadas por ronda: País, Nome, Cor, Animal, Objeto, Fruta, Cidade, Profissão, Marca ou Filme. Podes escolher quais jogar no setup.' },
  { icon: '⏱️', title: 'Timer', text: 'O jogador da vez tem o tempo definido para responder. Quando acaba, os outros validam e atribuem pontos com os botões +/−.' },
  { icon: '✍️', title: 'Resposta', text: 'Escreve no campo de texto ou usa o microfone. Submete a resposta e os outros jogadores votam Válido ou Inválido.' },
  { icon: '⭐', title: 'Pontuação', text: 'Cada resposta válida vale 1 ponto. O jogo termina após todas as letras serem usadas.' },
  { icon: '⏸️', title: 'Menu', text: 'Botão ⋯ (canto superior esquerdo) para pausar, saltar letra, ou recomeçar a qualquer momento.' },
];

const HOW_TO_PLAY_ONLINE = [
  { icon: '🏠', title: 'Criar sala', text: 'Um jogador cria a sala, escolhe o modo (Equipa ou Contra) e configura o tempo e categorias. É gerado um código de 4 letras.' },
  { icon: '🚪', title: 'Entrar na sala', text: 'O outro jogador entra com o código de 4 letras no seu dispositivo. Máximo 2 jogadores por sala.' },
  { icon: '🤝', title: 'Modo Equipa', text: 'Jogam juntos para o mesmo objectivo. Ambos vêem as respostas um do outro. Quando alguém acerta, a equipa avança. Se errar, pode tentar de novo.' },
  { icon: '⚔️', title: 'Modo Contra', text: 'Cada um joga para si. Não vês a resposta do adversário — só sabes se já acertou ou não. Quem acertar ganha o seu ponto. Podem ambos ganhar pontos na mesma ronda.' },
  { icon: '✓', title: 'Validação', text: 'Cada jogador auto-declara a sua resposta como correcta ou errada. Se errar, pode tentar de novo até acertar ou desistir da ronda.' },
  { icon: '💬', title: 'Chat', text: 'Botão 💬 durante o jogo para enviar emojis rápidos ao adversário.' },
  { icon: '🔄', title: 'Revanche', text: 'No ecrã de resultados, qualquer jogador pode propor uma revanche sem sair da sala.' },
];

export function AboutScreen() {
  const { dispatch } = useGame();

  return (
    <div className="about-screen">
      <div className="app-bg" />
      <div className="about-content">

        <div className="about-header animate-slide-up">
          <button className="about-back-btn" onClick={() => dispatch({ type: 'GO_TO_SETUP' })}>←</button>
          <h1 className="about-title">Sobre</h1>
          <div style={{ width: 40 }} />
        </div>

        {/* App info */}
        <Card className="about-app-card animate-scale-in">
          <Logo size="md" showName={false} />
          <div className="about-app-info">
            <h2 className="about-app-name">Letra a Letra</h2>
            <span className="about-version">v{VERSION}</span>
          </div>
          <p className="about-desc">
            O jogo tradicional das letras, agora digital. Para jogar com família e amigos em qualquer lugar — no mesmo ecrã ou em dispositivos diferentes.
          </p>
          <div className="about-author">
            <span>Desenvolvido por</span>
            <strong>Hugo</strong>
          </div>
        </Card>

        {/* Modo Local */}
        <div className="about-section-title animate-slide-up">🎮 Modo Local</div>
        <div className="about-steps">
          {HOW_TO_PLAY_LOCAL.map((step, i) => (
            <Card key={step.title} className="about-step animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }} padding="sm">
              <div className="about-step-icon">{step.icon}</div>
              <div className="about-step-text">
                <div className="about-step-title">{step.title}</div>
                <div className="about-step-desc">{step.text}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modo Online */}
        <div className="about-section-title animate-slide-up">🌐 Modo Multijogador Online</div>
        <div className="about-steps">
          {HOW_TO_PLAY_ONLINE.map((step, i) => (
            <Card key={step.title} className="about-step animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }} padding="sm">
              <div className="about-step-icon">{step.icon}</div>
              <div className="about-step-text">
                <div className="about-step-title">{step.title}</div>
                <div className="about-step-desc">{step.text}</div>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={() => dispatch({ type: 'GO_TO_SETUP' })}>
          Jogar agora
        </Button>

      </div>
    </div>
  );
}
