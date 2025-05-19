import { createSignal, createEffect, onCleanup } from 'solid-js';
import './App.css';
import ReconnectingWebSocket from '@opensumi/reconnecting-websocket';
import shuffleEmoji from './utils/shuffleEmoji';

function App() {
  const [_, setIsConnected] = createSignal(false);
  const [wins, setWins] = createSignal(0);
  const [losses, setLosses] = createSignal(0);

  const [currentEmoji, setCurrentEmoji] = createSignal<string | null>(null);

  let ws: ReconnectingWebSocket | null = null;

  const url = new URL(document.location.toString());
  const sp = url.searchParams;

  const shouldDisplayEmoji = sp.get('shouldDisplayEmoji') === 'true';
  const colour = sp.get('colour');
  const wColour = sp.get('wColour');
  const lColour = sp.get('lColour');
  const channel = sp.get('channel');

  setCurrentEmoji(shuffleEmoji());

  createEffect(() => {
    let el = (document.querySelector<HTMLDivElement>('.counters'));
    
    if (el !== null) {
      if (colour !== null) {
        el.style.color = `#${colour}`;
      }

      if (wColour !== null) {
        el.querySelector('span')!.style.color = `#${wColour}`;
      }

      if (lColour !== null) {
        el.querySelector<HTMLSpanElement>('span:nth-child(2)')!.style.color = `#${lColour}`
      }
    }
    
    if (!channel) {
      return;
    }

    const url = 'wss://irc-ws.chat.twitch.tv/';
    ws = new ReconnectingWebSocket(url, 'irc');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      ws?.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
      ws?.send('PASS blah\r\n');
      ws?.send('NICK justinfan12345\r\n');
      ws?.send(`JOIN #${channel}\r\n`);
      console.log(`Joining channel: #${channel}`);
    };
    ws.onmessage = (event) => {
      const message = (event.data as string).trim();

      if (message.startsWith('PING')) {
        ws?.send('PONG :tmi.twitch.tv');
        return;
      }

      const tagMatch = message.match(/^@([^ ]+) :([^!]+)!.* PRIVMSG #[^ ]+ :(.+)$/);
      const simpleMatch = message.match(/^:([^!]+)!.* PRIVMSG #[^ ]+ :(.+)$/);

      let user = '';
      let text = '';
      let badges: string[] = [];

      if (tagMatch) {
        const tagsString = tagMatch[1];
        const tags = tagsString.split(';').reduce<{ [key: string]: string }>((acc, tag) => {
          const [key, value] = tag.split('=');
          acc[key] = value;
          return acc;
        }, {});
        user = tagMatch[2];
        text = tagMatch[3];

        if (tags['badges']) {
          badges = tags['badges'].split(',').map(badge => badge.split('/')[0]);
        }
      } else if (simpleMatch) {
        user = simpleMatch[1];
        text = simpleMatch[2];
      }

      if (user && text) {
        const isBroadcaster = badges.includes('broadcaster');
        const isModerator = badges.includes('moderator');
        const isAllowed = isBroadcaster || isModerator;
        
        if (isAllowed) {
          const commandMatch = text.trim().match(/^!(\w+)(?:\s+(\d+))?$/);
          if (commandMatch) {
            const command = commandMatch[1].toLowerCase();
            console.log(command, user);
            const value = checkAndParseValue(commandMatch[2]);

            switch (command) {
              case 'win':
              case 'wins':
                setWins(prevWins => prevWins + value);
                console.log(`Wins updated by ${user}. Total wins: ${wins()}`);
                break;
              case 'loss':
              case 'losses':
                setLosses(prevLosses => prevLosses + value);
                console.log(`Losses updated by ${user}. Total losses: ${losses()}`);
                break;
              case 'removewin':
              case 'removewins':
                setWins(prevWins => prevWins - value);
                console.log(`Wins updated by ${user}. Total wins ${wins()}`);
                break;
              case 'removeloss':
              case 'removelosses':
                  setLosses(prevLosses => prevLosses - value);
                  console.log(`Losses updated by ${user}. Total losses ${losses()}`);
                break;
              case 'clearwin':
              case 'clearwins':
                setWins(_ => 0);
                console.log(`Cleared wins by ${user}.`);
                break;
              case 'clearloss':
              case 'clearlosses':
                  setLosses(_ => 0);
                  console.log(`Cleared losses by ${user}`);
                  break;
              case 'shuffleemoji':
                let emoji = shuffleEmoji();
                setCurrentEmoji(emoji);
                break;
              default:
                console.log(`Unknown command "${command}" triggered by ${user}`);
                break;
            }
          }
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
    };

    onCleanup(() => {
      console.log('Cleaning up WebSocket connection');
      ws?.close();
    });
  });


  return (
    <div class="app-container">
      <div class="counters">
        <span>W{wins()}</span>
        -
        <span>L{losses()}</span>
      </div>
      {shouldDisplayEmoji && currentEmoji() && <img src={`/${currentEmoji()}`} />}
    </div>
  );
}

function checkAndParseValue(value: unknown, defaultValue = 1): number {
  console.log('Value', value);
  console.log('Default', defaultValue);
  let val = Number(value);

  return (!Number.isNaN(val) ? val : defaultValue) || defaultValue;
}

export default App;
