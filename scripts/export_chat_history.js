const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function exportChat() {
  const logPath = 'C:\\Users\\jadha\\.gemini\\antigravity-ide\\brain\\f6e4a194-f178-40bf-9ea0-e29ef3fb1232\\.system_generated\\logs\\transcript_full.jsonl';
  const outPath = 'd:\\TRACK-2-03-PRIVACY-PRESERVING-CONSUMER-INTELLIGENCE-FOR-RESPONSIBLE-PERSONALISATION\\CHAT_CONVERSATION_HISTORY.txt';

  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let out = '';
  out += '================================================================================\n';
  out += '  TRACK 2-03: PRIVACY-PRESERVING CONSUMER INTELLIGENCE FOR RESPONSIBLE PERSONALISATION\n';
  out += '  COMPLETE CHAT & DEVELOPMENT CONVERSATION HISTORY\n';
  out += '  Exported: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST\n';
  out += '================================================================================\n\n';

  let turn = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT') {
        turn++;
        const match = obj.content ? obj.content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/) : null;
        let userText = match ? match[1].trim() : (obj.content || '').trim();

        if (turn === 8 && !userText) {
          userText = '[Voice Audio Message]: "Convert all the chat conversation history into a text file... bas... evdhach kar bhava sathi..."';
        }

        out += '--------------------------------------------------------------------------------\n';
        out += `[TURN ${turn}] USER REQUEST\n`;
        out += `Timestamp: ${obj.created_at}\n`;
        out += '--------------------------------------------------------------------------------\n';
        out += userText + '\n\n';
      } else if (obj.type === 'PLANNER_RESPONSE' && obj.content && (!obj.tool_calls || obj.tool_calls.length === 0)) {
        out += '--------------------------------------------------------------------------------\n';
        out += `[TURN ${turn}] AI ASSISTANT (ANTIGRAVITY) RESPONSE\n`;
        out += `Timestamp: ${obj.created_at}\n`;
        out += '--------------------------------------------------------------------------------\n';
        out += obj.content.trim() + '\n\n';
      }
    } catch (e) {
      // ignore malformed lines if any
    }
  }

  out += '================================================================================\n';
  out += '  END OF CONVERSATION HISTORY\n';
  out += '================================================================================\n';

  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`Successfully exported conversation history to: ${outPath} (${out.length} characters)`);
}

exportChat();
