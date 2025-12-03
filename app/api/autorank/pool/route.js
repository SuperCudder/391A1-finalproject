import { NextResponse } from 'next/server';

const CARQUERY_API = 'https://www.carqueryapi.com/api/0.3/';

function statToParam(stat) {
  switch (stat) {
    case 'horsepower':
      return 'min_power=200';
    case 'weight':
      return 'min_weight=1000';
    // Add or change any stats as needed 
    default:
      return '';
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const stat = searchParams.get('stat') || 'horsepower';
  const count = parseInt(searchParams.get('count') || '5', 10);

  // Get available years
  const yearsRes = await fetch(`${CARQUERY_API}?cmd=getYears`);
  const yearsData = await yearsRes.json();
  const minYear = parseInt(yearsData.Years.min_year, 10);
  const maxYear = parseInt(yearsData.Years.max_year, 10);
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;

  const statParam = statToParam(stat);
  const trimsRes = await fetch(`${CARQUERY_API}?cmd=getTrims&year=${year}&${statParam}&sold_in_us=1`);
  const trimsData = await trimsRes.json();
  let trims = trimsData.Trims || [];

  // Shuffle and pick 'count' cars
  trims = trims.sort(() => 0.5 - Math.random()).slice(0, count);

  return NextResponse.json(trims);
}