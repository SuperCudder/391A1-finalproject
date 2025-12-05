/**
 * Author: Lucas Lotze
*/

import { NextResponse } from 'next/server';

const CARQUERY_API = 'https://www.carqueryapi.com/api/0.3/';

/*convert stat filter to api param*/
function statToParam(stat) {
  switch (stat) {
    case 'horsepower':
      return 'min_power=80';
    case 'weight':
      return 'min_weight=1000';
    default:
      return '';
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const stat = searchParams.get('stat') || 'horsepower';
  const count = parseInt(searchParams.get('count') || '5', 10);

  /*get available years*/
  const yearsRes = await fetch(`${CARQUERY_API}?cmd=getYears`);
  const yearsData = await yearsRes.json();
  const apiMinYear = parseInt(yearsData.Years.min_year, 10);
  const apiMaxYear = parseInt(yearsData.Years.max_year, 10);

  /*restrict range: 1970-today*/
  const minYear = Math.max(1970, apiMinYear);
  const maxYear = apiMaxYear;
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;

  const statParam = statToParam(stat);
  const trimsRes = await fetch(`${CARQUERY_API}?cmd=getTrims&year=${year}&${statParam}&sold_in_us=1`);
  const trimsData = await trimsRes.json();
  let trims = trimsData.Trims || [];

  /* shuffle and pick */
  trims = trims.sort(() => 0.5 - Math.random()).slice(0, count);

  return NextResponse.json(trims);
}