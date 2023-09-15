REPOSITORY=/home/ubuntu/jonghun
NODE_APP_DIR=$REPOSITORY/Node-Alpha-BE
BACKEND_ENV_PATH=$NODE_APP_DIR/.env.production


cd $REPOSITORY

NODE_PID=$(pgrep -f "node")
if [ -z $NODE_PID ]
then
  echo "> 종료할 Node Express 애플리케이션이 없습니다."
else
  echo "> kill Node Express app with PID: $NODE_PID"
  kill -15 $NODE_PID
  sleep 5
fi

# Backend 환경 변수 설정
if [ -f $BACKEND_ENV_PATH ]; then
    source $BACKEND_ENV_PATH
else
    echo "> ]/.env.production 파일이 존재하지 않습니다."
fi

# Backend 의존성 패키지 설치
echo "> Installing backend dependencies"
cd $NODE_APP_DIR
/usr/bin/yarn install

# Backend 앱 실행
echo "> Starting Node Express app"
cd $NODE_APP_DIR
/usr/bin/yarn start:prod