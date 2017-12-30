import React, { Component } from 'react';
import FotoItem from './Foto';
import Pubsub from 'pubsub-js';
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'

export default class Timeline extends Component {

    constructor(props){
      super(props);
      this.state = {fotos:[]};
      this.login = this.props.login;
    }

    carregaFotos() {
      // //let so vale pro escopo diferente do var
      let urlPerfil;
      if(this.login === undefined) {
        urlPerfil = `http://localhost:8080/api/fotos?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`
      } else {
        urlPerfil = `http://localhost:8080/api/public/fotos/${this.login}`
      }
      fetch(urlPerfil)
      .then(response => response.json())
      .then(fotos => {
        this.setState({fotos:fotos});
      });
    }

    //se pede o mesmo componente nao renderiza o didMount de novo
    componentDidMount(){
      this.carregaFotos();
    }

    componentWillMount() {
      Pubsub.subscribe('timeline', (topico, fotos) => {
        this.setState({fotos})
        //shorthand fotos:fotos
      })

      //infoLiker = liker, que vem do like event
      //fotoId = ID Componente foto (atualizacoes)
      Pubsub.subscribe('atualiza-liker', (topico, infoLiker) => {
        const fotoAchada = this.state.fotos.find(foto => foto.id === infoLiker.fotoId);
        fotoAchada.likeada = !fotoAchada.likeada;
        
        const possivelLiker = fotoAchada.likers.find(liker => liker.login === infoLiker.liker.login)
        
        if (possivelLiker === undefined) {
          fotoAchada.likers.push(infoLiker.liker);
        } else {
          const novosLikers = fotoAchada.likers.filter(liker => liker.login !== infoLiker.liker.login)
          fotoAchada.likers = novosLikers;
          //true ele mantem na lista
          //false não mantém na nova lista
          //manter todos que tem login diferente do infoliker
        }
        this.setState({
          fotos: this.state.fotos
        });
      })

      Pubsub.subscribe('novos-comentarios', (topico, infoComentario) => {
        const fotoAchada = this.state.fotos.find(foto => foto.id === infoComentario.fotoId); 
        fotoAchada.comentarios.push(infoComentario.novoComentario);
          this.setState({
            fotos: this.state.fotos
          })
      });

    }

    //chama o componente de novo passando um parametro
    //renderizado novamente com acesso as novas propriedades
    //alteração de estado e re-renderização com novas props
    componentWillReceiveProps(nextProps) {
      if(nextProps.login !== undefined) {
        this.login = nextProps.login;
        this.carregaFotos();
      }
    }

    like(fotoId) {
        //requisição para o endpoint
      fetch(`http://localhost:8080/api/fotos/${fotoId}/like?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`, {method: 'POST'})
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw new Error("Não foi possível realizar o like na foto")
        }
      })
      .then (liker => {
        Pubsub.publish('atualiza-liker', {fotoId, liker});
        //publica alguem escuta
      })
    }


    comenta(fotoId, textoComentario) {
      const requestInfo = {
        method: 'POST',
        body: JSON.stringify({texto: textoComentario}),
        headers: new Headers({
          'Content-type' : 'application/json'
        })
      }
  
      fetch(`http://localhost:8080/api/fotos/${fotoId}/comment?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`, requestInfo)
      .then(response => {
        if(response.ok) {
          return response.json();
        }else {
          throw new Error ("Não foi possível comentar");
          //pubsub pra mostrar mensagem
          //catch para tratar
        }
      })
      .then(novoComentario => {
        Pubsub.publish('novos-comentarios', {fotoId, novoComentario})
      })
    }

    render(){
        return (
        <div className="fotos container">
        <ReactCSSTransitionGroup
          transitionName="timeline"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
           {
            this.state.fotos.map(foto => <FotoItem key={foto.id} foto={foto} like={this.like} comenta={this.comenta}/>)
            //id de cada foto pois se repete varios componentes
          }         
        </ReactCSSTransitionGroup>       
        </div>            
        );
    }
}