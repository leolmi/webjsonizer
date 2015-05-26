/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/editor', {
        templateUrl: 'app/editor/editor.html',
        controller: 'EditorCtrl'
      });
  });


//var sequence = [{
//  title:'DEFAULT',
//  method:'POST',
//  path:process.env.INAZ_PATH_DEFAULT,
//  referer:process.env.INAZ_PATH_REFERER_LOGIN,
//  data: {
//    IdLogin: reqopt.user.name,
//    IdPwdCript: encpsw,
//    IdFrom: 'LOGIN',
//    RetturnTo: process.env.INAZ_PATH_REFERER_LOGIN
//  }
//},{
//  title:'TOPM',
//  method:'GET',
//  path:process.env.INAZ_PATH_TOPM,
//  referer:process.env.INAZ_PATH_REFERER_DEFAULT
//},{
//  title:'BLANK',
//  method:'GET',
//  path:process.env.INAZ_PATH_BLANK,
//  referer:process.env.INAZ_PATH_REFERER_DEFAULT
//},{
//  title:'HOME',
//  method:'POST',
//  path:process.env.INAZ_PATH_HOME,
//  referer:process.env.INAZ_PATH_REFERER_TOPM,
//  data: {
//    AccessCode:process.env.INAZ_P2_AccessCode,
//    ParamFrame:'',
//    VoceMenu:'',
//    ParamPage:''
//  }
//},{
//  title:'START',
//  method:'POST',
//  path:process.env.INAZ_PATH_START,
//  referer:process.env.INAZ_PATH_REFERER_TOPM,
//  data:{
//    AccessCode:process.env.INAZ_P2_AccessCode,
//    ParamFrame:paramsReplace(process.env.INAZ_START_ParamFrame),
//    ParamPage:'',
//    VoceMenu:process.env.INAZ_P1_VoceMenu
//  }
//},{
//  title:'FIND',
//  method:'POST',
//  path:process.env.INAZ_PATH_FIND,
//  referer:process.env.INAZ_PATH_REFERER_START,
//  data: {
//    AccessCode:process.env.INAZ_P2_AccessCode,
//    ParamPage:paramsReplace(process.env.INAZ_FIND_ParamPage)
//  }
//},{
//  title:'TIMB',
//  method:'POST',
//  path:process.env.INAZ_PATH_TIMB,
//  referer:process.env.INAZ_PATH_REFERER_FIND,
//  data: {
//    AccessCode:process.env.INAZ_P2_AccessCode,
//    ParamPage:paramsReplace(process.env.INAZ_TIMB_ParamPage),
//    ListaSel:'',
//    ActionPage:'',
//    NomeFunzione:process.env.INAZ_TIMB_NomeFunzione,
//    ValCampo:'',
//    ValoriCampo:'',
//    CampoKey:'',
//    StatoRiga:'',
//    ParPagina:'',
//    Matches:''
//  }
//}];
