/// <reference types="node" />
import { io } from 'socket.io-client';

const socket1 = io('http://localhost:5000');
const socket2 = io('http://localhost:5000');

console.log('🧪 Starting Socket.io verification test...');

socket1.on('connect', () => {
  console.log('✅ Socket 1 connected:', socket1.id);
  socket1.emit('join-room', { 
    roomId: 'test-verification-room', 
    user: { name: 'Interviewer Alice', color: '#6366f1' },
    initialLanguage: 'javascript'
  });
});

socket1.on('room-state', (state) => {
  console.log('✅ Socket 1 received initial room state:', { roomId: state.roomId, usersCount: state.users.length });
  // Connect socket 2
  socket2.connect();
});

socket2.on('connect', () => {
  console.log('✅ Socket 2 connected:', socket2.id);
  socket2.emit('join-room', { 
    roomId: 'test-verification-room', 
    user: { name: 'Candidate Bob', color: '#10b981' } 
  });
});

socket2.on('user-joined', (data) => {
  console.log('✅ Socket 2 saw user joined:', data.user.name);
});

socket1.on('user-joined', (data) => {
  console.log('✅ Socket 1 saw user joined:', data.user.name);
  console.log('🚀 Socket 1 emitting keystroke delta...');
  socket1.emit('code-delta', {
    roomId: 'test-verification-room',
    changes: [
      { range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }, text: '// Collaborative Edit\n' }
    ],
    fullCode: '// Collaborative Edit\nfunction interviewSolution() {\n  return true;\n}'
  });
});

socket2.on('remote-delta', (data) => {
  console.log('🎉 Socket 2 successfully received remote delta update!');
  console.log('   New Room Version:', data.version);
  console.log('   Synchronized Code:\n' + data.fullCode);

  socket1.disconnect();
  socket2.disconnect();
  console.log('✨ All Milestone 1 & 2 Socket.io sync tests passed cleanly!');
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Test timed out after 10 seconds');
  process.exit(1);
}, 10000);
