import { createSignal, createEffect, onCleanup } from 'solid-js';
import './App.css';
import ReconnectingWebSocket from '@opensumi/reconnecting-websocket';

function App() {
  const [_, setIsConnected] = createSignal(false);
  const [wins, setWins] = createSignal(0);
  const [losses, setLosses] = createSignal(0);

  let ws: ReconnectingWebSocket | null = null;

  createEffect(() => {
    const url = 'wss://irc-ws.chat.twitch.tv/';
    const channel = new URL(document.location.toString()).searchParams.get('channel') || 'lexedia';
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
            const value = commandMatch[2] ? Number(commandMatch[2]) : 1;

            switch (command) {
              case 'win':
                setWins(prevWins => prevWins + (Number.isNaN(value) ? 1 : value));
                console.log(`Wins updated by ${user}. Total wins: ${wins()}`);
                break;
              case 'loss':
                setLosses(prevLosses => prevLosses + (Number.isNaN(value) ? 1 : value));
                console.log(`Losses updated by ${user}. Total losses: ${losses()}`);
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
    </div>
  );
}

export default App;
