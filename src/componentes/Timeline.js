import React, { Component } from 'react';
import FotoItem from './Foto';

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

    //chama o componente de novo passando um parametro
    //renderizado novamente com acesso as novas propriedades
    //alteração de estado e re-renderização com novas props
    componentWillReceiveProps(nextProps) {
      if(nextProps.login !== undefined) {
        this.login = nextProps.login;
        this.carregaFotos();
      }
    }

    render(){
        return (
        <div className="fotos container">
          {
            this.state.fotos.map(foto => <FotoItem key={foto.id} foto={foto}/>)
            //id de cada foto pois se repete varios componentes
          }                
        </div>            
        );
    }
}