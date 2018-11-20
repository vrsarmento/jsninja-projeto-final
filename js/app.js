(function(DOM) {
  'use strict';

  /*
  Vamos estruturar um pequeno app utilizando módulos.
  Nosso APP vai ser um cadastro de carros. Vamos fazê-lo por partes.
  A primeira etapa vai ser o cadastro de veículos, que deverá funcionar da
  seguinte forma:
  - No início do arquivo, deverá ter as informações da sua empresa - nome e
  telefone (já vamos ver como isso vai ser feito)
  - Ao abrir a tela, ainda não teremos carros cadastrados. Então deverá ter
  um formulário para cadastro do carro, com os seguintes campos:
    - Imagem do carro (deverá aceitar uma URL)
    - Marca / Modelo
    - Ano
    - Placa
    - Cor
    - e um botão "Cadastrar"

  Logo abaixo do formulário, deverá ter uma tabela que irá mostrar todos os
  carros cadastrados. Ao clicar no botão de cadastrar, o novo carro deverá
  aparecer no final da tabela.

  Agora você precisa dar um nome para o seu app. Imagine que ele seja uma
  empresa que vende carros. Esse nosso app será só um catálogo, por enquanto.
  Dê um nome para a empresa e um telefone fictício, preechendo essas informações
  no arquivo company.json que já está criado.

  Essas informações devem ser adicionadas no HTML via Ajax.

  Parte técnica:
  Separe o nosso módulo de DOM criado nas últimas aulas em
  um arquivo DOM.js.

  E aqui nesse arquivo, faça a lógica para cadastrar os carros, em um módulo
  que será nomeado de "app".
  */

  function app(){

    var $company_name = DOM('[data-js="company_name"]');
    var $company_phone = DOM('[data-js="company_phone"]');
    var $alert = DOM('[data-js="alert"]');

    var $car_image = DOM('[data-js="car_image"]');
    var $car_model = DOM('[data-js="car_model"');
    var $car_year = DOM('[data-js="car_year');
    var $car_license = DOM('[data-js="car_license');
    var $car_color = DOM('[data-js="car_color');

    var $table_body = DOM('[data-js="table_body"]');
    var carsList = [];

    var car = newCarObject();

    function newCarObject(){
      return {
        image : {value: '', type: 'image'},
        brandModel : {value: '', type: 'text'},
        year : {value: '', type: 'number'},
        licensePlate : {value: '', type: 'text'},
        color: {value: '', type: 'text'},
      };
    }
    
    function initEvents(){
      DOM('[data-js="form"]').on('submit', handleFormSubmit);
    }

    function addButtonsEvents(){
      var $delete_buttons = DOM('[data-js="delete_button"]');
      $delete_buttons.on('click', handleClickDeleteButton);
    }

    function getCompanyInfo(){
      var ajax = new XMLHttpRequest();
      ajax.open('GET', 'company.json');
      ajax.send();
      ajax.addEventListener('readystatechange', handleReadyCompanyInfo);
    }

    function handleReadyCompanyInfo(){
      if(isRequestOk.call(this)){
        var data = parseData.call(this);
        $company_name.get().textContent = data.name;
        $company_phone.get().textContent = data.phone;
      }
    }

    function isRequestOk(){
			return this.readyState === 4 && this.status === 200;
    }
    
    function parseData(){
			var result;
			try{
				result = JSON.parse(this.responseText);
			}catch(e){
				result = null;
      }
			return result;
		}

    function handleFormSubmit(e){
      e.preventDefault();
      hideAlert();
      if(verifyUserEntry()){
        fillCarObject();
        addCarInRestAPI();
      }
    }
    
    function verifyUserEntry(){
      if(hasEmptyField()){
        getMessage('empty');
        return false;
      }
      if(!isValidUrl(DOM('[data-js="car_image"]').get().value)){
        getMessage('invalid_url');
        DOM('[data-js="car_image"]').get().focus();
        return false;
      }
      if(!areAllNumberFields()){
        getMessage('not_number');
        return false;
      }
      return true;
    }

    function fillCarObject(){
      car.image.value = $car_image.get().value;
      car.brandModel.value = $car_model.get().value;
      car.year.value = $car_year.get().value;
      car.licensePlate.value = $car_license.get().value;
      car.color.value = $car_color.get().value;
    }

    function addCarInRestAPI(){
      var addCarData = new XMLHttpRequest();
      addCarData.open('POST', 'http://localhost:3000/car');
      addCarData.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      addCarData.send(stringifyCarDataToSend(car));
      addCarData.addEventListener('readystatechange', function(){
        if(isRequestOk.call(this))
          getCarsListFromRestAPI();
      }, false);
    }

    function stringifyCarDataToSend(item){
      var keys = Object.keys(car);
      var dataToSend = '';
      keys.map(function(prop){
        dataToSend += prop + '=' + item[prop].value + '&';
      });
      return dataToSend.slice(0, dataToSend.length - 1);
    }

    function getCarsListFromRestAPI(){
      var getCarsData = new XMLHttpRequest();
      getCarsData.open('GET', 'http://localhost:3000/car');
      getCarsData.send();
      getCarsData.addEventListener('readystatechange', handleCarsData, false);
    }

    function handleCarsData(){
      carsList = [];
      if(isRequestOk.call(this)){
        var data = parseData.call(this);
        var newCar = [];
        data.forEach(function(item, index){
          var keys = Object.keys(car);
          newCar[index] = Object.assign({}, newCarObject());
          keys.map(function(prop){
            newCar[index][prop].value = item[prop];
          });
          carsList.push(newCar[index]);
        });
        updateTableCars();
      }
    }

    function deleteCarInRestAPI(index){
      var deleteCarData = new XMLHttpRequest();
      deleteCarData.open('DELETE', 'http://localhost:3000/car');
      deleteCarData.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      deleteCarData.send('indexToDelete=' + index);
      deleteCarData.addEventListener('readystatechange', function(){
        if(isRequestOk.call(this))
          getCarsListFromRestAPI();
      }, false);
    }

    function updateTableCars(){
      $table_body.get().innerHTML = '';
      if(carsList.length > 0){
        var $fragment = document.createDocumentFragment();
        var keys = Object.keys(newCarObject());
        carsList.forEach(function(item, index){
          var $tr = document.createElement('tr');
          var $th = document.createElement('th');
          $th.setAttribute('scope', 'row');
          $tr.appendChild($th);
          $th.textContent = index + 1;
          keys.map(function(prop){
            if(item[prop].type === 'image'){
              var $img = document.createElement('img');
              $img.setAttribute('src', item[prop].value);
              var $td = document.createElement('td');
              $td.appendChild($img);
            }else{
              var $td = document.createElement('td');
              $td.textContent = item[prop].value;
            }
            $tr.appendChild($td);
          });
          var $td = document.createElement('td');
          $td.appendChild(createDeleteButton(index));
          $tr.appendChild($td);
          $fragment.appendChild($tr);
        });

        $table_body.get().appendChild($fragment);
        addButtonsEvents();
      }
    }

    function createDeleteButton(index){
      var $button = document.createElement('button');
      $button.textContent = 'Remover';
      $button.setAttribute('type', 'button');
      $button.setAttribute('data-js', 'delete_button');
      $button.setAttribute('data-index', index);
      $button.classList.add('btn', 'btn-danger', 'btn-sm');
      return $button;
    }

    function handleClickDeleteButton(e){
      var deleteCar = e.target.getAttribute('data-index');
      deleteCarInRestAPI(deleteCar);
    }

    function hasEmptyField(){
      var $required = DOM('[data-required="1"]');
      return $required.some(function(element){
        return element.value === '';
      });
    }

    function areAllNumberFields(){
      var $number = DOM('[data-number="1"]');
      return $number.every(function(element){
        return !isNaN(element.value);
      });
    }

    function isValidUrl(url){
      var urlRegex = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm);
      return urlRegex.test(url);
    }

    function getMessage(type){
			var messages = {
				empty: 'Preencha todos os campos obrigatórios.',
        invalid_url: 'Preencha o campo com uma URL válida.',
        not_number: 'Preencha os campos indicados somente com números.',
        car_add_success: 'Carro cadastrado com sucesso.',
        car_add_error: 'Não foi possível cadastrar o carro. Tente novamente.'
      };
      $alert.get().textContent = messages[type];
      showAlert();
    }
    
    function showAlert(){
      $alert.get().style.display = 'block'; 
    }

    function hideAlert(){
      $alert.get().style.display = 'none'; 
    }

    return {
      init: function init(){
        getCompanyInfo();
        initEvents();
        getCarsListFromRestAPI();
      }
    }

  }

  app().init();

})(window.DOM);
