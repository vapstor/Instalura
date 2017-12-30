import React, { Component } from 'react';
import {browserHistory} from  'react-router';

export default class Login extends Component {

    constructor(props){
        super(props);        
        this.state = {msg:this.props.location.query.msg};
        //mensagem para indicar se ouve erro na autenticação
    }

    envia(event){
        event.preventDefault();
        //prevent para usar ajax


        //parametro para usar a função fetch como POST
        const requestInfo = {
            method:'POST',
            body:JSON.stringify({login:this.login.value,senha:this.senha.value}),
            headers:new Headers({
                'Content-type' : 'application/json' 
            })
        };

        fetch('http://localhost:8080/api/public/login',requestInfo)
            .then(response => {
                if(response.ok) {
                    return response.text();
                } else {
                    throw new Error('não foi possível fazer o login');
                }
            })
            .then(token => {
                localStorage.setItem('auth-token',token);
                browserHistory.push('/timeline');
                //push - navegação na sequencia para tal pagina (timeline)
            })
            .catch(error => {
                this.setState({msg:error.message});
            });
    }

    render(){
        return (
            <div className="login-box">
                <h1 className="header-logo">Instalura</h1>
                <span>{this.state.msg}</span>
                <form onSubmit={this.envia.bind(this)}>
                {/* passa a referencia this do form (inputs) */}
                    <input type="text" ref={(input) => this.login = input}/>
                    {/* ref - referencia para input - argumento -> input - atributo login recebe input */}
                    <input type="password" ref={(input) => this.senha = input}/>
                    <input type="submit" value="login"/>
                </form>
            </div>
        );
    }
}