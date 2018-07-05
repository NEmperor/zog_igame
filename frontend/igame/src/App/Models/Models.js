import session from '../User/session';

const HOST = 'http://192.168.0.20:8069';
const DATABASE = 'TT';

class OdooRpc {      
    /**
     * @param {*} 
     * 单例模式，如果已经有对象了，就直接取出来，无需重新实例化。
     */
    static create(success,error) {
        if (OdooRpc.models === null) {
            OdooRpc.models = new OdooRpc();
        }
        OdooRpc.models.success=success;
        OdooRpc.models.error=error;
        return OdooRpc.models;
    }
    jsonrpc(url,data){
        const data1 = {
            "jsonrpc":"2.0",
            "method":"call",
            "id":Math.floor(Math.random()*100),
            "params":data
        }
        fetch(url,{
            method:'POST',
            body:JSON.stringify(data1),
            // body:JSON.stringify(json),
            headers:new Headers({
                'Content-Type':'application/json'
            })
        }).then(res=>res.json()
        ).catch(error=>console.error('Error:',error)
        ).then(response => {
            console.log(response.result);
            if (response.result){
            // m.result = response.result;
                this.success(response.result)
            }else{
                this.error(response.result)
            }
        });
    }
}
// 静态属性。ES6 
OdooRpc.models = null;

class Models{       //用于被继承，来接受回调函数success，error
    constructor(success,error){
        this.success=success;
        this.error=error;
        this.m = OdooRpc.create(this.success,this.error)
    }
    exec (model,method,kw={},...args){
        const url = HOST+'/json/api?session_id='+session.get_sid();
        const data = {
            'model':model,
            'method':method,
            'args':args,
            'kw':kw,
        }
        return this.m.jsonrpc(url,data)
    }
}

class User extends Models {
    login(login,password){
        const url = HOST+'/json/user/login';
        const data = {
            'db':DATABASE,
            'login':login,
            'password':password,
        }
        return this.m.jsonrpc(url,data)
    }
    register(login,password){
        const url = HOST+'/json/user/register';
        const data = {
            'db':DATABASE,
            'login':login,
            'password':password,
        }
        return this.m.jsonrpc(url,data)
    }
    resetPassword(login,password){
        const url = HOST+'/json/user/reset/password';
        const data = {
            'db':DATABASE,
            'login':login,
            'password':password,
        }
        return this.m.jsonrpc(url,data)
    }
}
class GameTeam extends Models{
    // this.result = None
    get_teams(){        //获取我的赛队列表
        this.exec('og.igame.team', 'get_teams',{},[]);
    }
    create_team(...data){   //创建赛队（报名）
        this.exec('og.igame.team','create_team',{},...data);
    }
    get_own_teams(){        //?请求赛队列表
        this.exec('og.igame.team','get_own_teams',{},[]);
    }
}
class Game extends Models{
    get_users(){        //获取所有用户
        this.exec('og.igame','get_users',{},[]);
    }
    register_game(...data){        //赛队报名
        this.exec('og.igame','register_game',{},...data);
    }
    search2(){
        this.exec('og.igame','search2',{},[]);
    }
}

export { User, GameTeam, Game };