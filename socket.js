class socket {
    connect(app) {
        const server = app.listen(process.env.PORT || 3000);
        const io = require('socket.io')(server);

        var listRoom = [];
        var boards = {};
        var count = {};
        var draw;
        var turn = {};
        function addPerson(data) {
            for (let i of listRoom) {
                if (i.name == data.room) {
                    i.person = 2;
                    return 2;
                }
            }
            listRoom.push(
                {
                    name: data.room,
                    person: 1
                }
            )
            return 1;
        }


        function leaveRoom(room) {
            for (let i = 0; i < listRoom.length; i++) {
                if (listRoom[i].name == room && listRoom[i].person == 1) {
                    listRoom.splice(i, 1);
                    delete turn[room];
                    return;
                }
                if (listRoom[i].name == room && listRoom[i].person == 2) {
                    listRoom[i].person = 1;
                    return 1;
                }
            }
        }

        function checkWin(arr, user, r, c) {
            let row = parseInt(r);
            let col = parseInt(c);
            var count = 0;
            // check Horizontal
            let i = 0;
            let ok = 0;
            while (col + i < 20) {
                if (arr[row][col + i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }


            i = -1;
            while (col + i >= 0) {
                if (arr[row][col + i] == user) {
                    count++;
                    i--;
                }
                else {
                    if (arr[row][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }



            if (count >= 4 && ok == 1) return true;


            // check vertical
            i = 0;
            ok = 0;
            count = 0;
            while (row + i < 20) {
                if (arr[row + i][col] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row + i][col] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break
                };
            }

            i = -1;
            while (row + i >= 0) {
                if (arr[row + i][col] == user) {
                    count++;
                    i--;
                }
                else {
                    if (arr[row + i][col] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }
            if (count >= 4) return true;

            // check cross row \
            i = 0;
            ok = 0;
            count = 0;
            while (row + i < 20 && col + i < 20) {
                if (arr[row + i][col + i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row + i][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            i = -1;
            while (row + i >= 0 && col + i >= 0) {
                if (arr[row + i][col + i] == user) {
                    count++;
                    i--;
                }
                else {
                    if (arr[row + i][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            if (count >= 4) return true;

            // check cross row /
            i = 0;
            ok = 0;
            count = 0;
            while (row + i < 20 && col - i >= 0) {
                if (arr[row + i][col - i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row + i][col - i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            i = 1;
            while (row - i >= 0 && col + i < 20) {
                if (arr[row - i][col + i] == user) {
                    count++;
                    i++;
                }
                else {
                    if (arr[row - i][col + i] == 0) {
                        ok = 1
                    } else {
                        count--;
                    }
                    break;
                };
            }

            if (count >= 4) return true;

            return false;
        }

        function clearBoard(room) {
            let l = boards[room].length;
            for (let i = 0; i < l; i++) {
                boards[room].shift();
                boards[room].push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
            count[room] = 0;
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return [...array];
        }

        

        io.on('connection', socket => {
            var boardCaro = [];
            for (let i = 0; i < 20; i++) {
                boardCaro.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
            var room;
            var you;
            var autoHit = null;

            clearTimeout(autoHit);

            socket.on('connected', data => {
                clearTimeout(autoHit);
                socket.join(data.room);
                you = addPerson(data);
                room = data.room
                boards[room] = boardCaro;
                count[room] = 0;
                turn[room] = 1;
                socket.to(room).emit('competitor',data.user);
            })


            function randomHit(you, room){
                let arr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
                let rows = shuffleArray(arr);
                let cols = shuffleArray(arr);
                
                rows.forEach((i)=>{
                    cols.forEach((j)=>{
                        if(boards[room][i][j] == 0){
                        socket.to(room).emit('auto-hit', i, j);
                        clearTimeout(autoHit);
                        return;
                    } 
                    })
                })
            }

               
            function hit(row,col){
                if (turn[room] != you) return;
                var data = you == 1 ? 'x' : 'o';
                if (boards[room][row][col] == 0) {

                    clearTimeout(autoHit);
                    count[room]+=1;
                    socket.to(room).emit('my-turn');
                    socket.emit('friend-turn');
                    io.in(room).emit('next-caro', row, col, data);
                    boards[room][row][col] = you;
                    if (checkWin(boards[room], you, row, col)) {
                        socket.emit('win', true)
                        socket.to(room).emit('win', false);
                        clearBoard(room);
                        clearTimeout(autoHit);
                        turn[room] = you == 1 ? 2 : 1;
                        turn[room]= -turn[room];   // khong ai duoc danh
                        return;
                    };

                    if(count[room] == 400){
                        io.in(room).emit('win', 'no win or lose');
                        clearBoard(room);
                        clearTimeout(autoHit);
                        turn[room] = you == 1 ? 2 : 1;
                        turn[room]= -turn[room];   // khong ai duoc danh
                        return;
                    }

                    turn[room] = you == 1 ? 2 : 1;

                    autoHit = setTimeout(()=>{
                        randomHit(turn[room],room);
                    },16000)
                }
            }
            
            


            // hit caro
            socket.on('hit', hit )

            // xin hoa
            draw = false;
            socket.on('draw',()=>{
                draw = true;
                socket.to(room).emit('draw please');
                setTimeout(()=>{
                    draw = false;
                },5000);
            })

            socket.on('accept draw',()=>{
                if(draw){
                    io.in(room).emit('win', 'no win or lose');
                    clearBoard(room);
                    clearTimeout(autoHit);
                    turn[room] = you == 1 ? 2 : 1;
                    turn[room]= -turn[room];   // khong ai duoc danh
                    return;
                }
            });

            socket.on('end',()=>{
                clearTimeout(autoHit);
            })

            socket.on('clear',()=>{
                turn[room] = Math.abs(turn[room]);
                clearTimeout(autoHit);
                clearBoard(room);
            })



            socket.on('friend-in',(nameCompetitor)=>{
                clearTimeout(autoHit);
                clearBoard(room);
                socket.to(room).emit('reply',nameCompetitor)
            })


            socket.on('friend-out', () => {
                you = 1;
                turn[room] = you;
                clearTimeout(autoHit);
                clearBoard(room);
            })

            // Chat
            socket.on('client-sent-data', data => {
                socket.to(data.room).emit('server-sent-data', data);
            });



            socket.on('disconnect', () => {
                clearTimeout(autoHit);
                you = leaveRoom(room);
                socket.to(room).emit('friend-out');
            })

        })
    }

}

module.exports = new socket();