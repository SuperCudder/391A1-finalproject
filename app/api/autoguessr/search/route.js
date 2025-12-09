/**
 * Author: Jonah Kastelic
 */

import { NextResponse } from 'next/server';

const CARQUERY_API = 'https://www.carqueryapi.com/api/0.3/';

/*search for makes that match the query*/
async function searchMakes(query) {
  if (!query || query.length < 1) return [];

  const makesRes = await fetch(`${CARQUERY_API}?cmd=getMakes&sold_in_us=1`);
  if (!makesRes.ok) return [];

  const makesData = await makesRes.json();
  const makes = makesData.Makes || [];

  /*filter makes that match query*/
  const filtered = makes.filter(make =>
    make.make_display.toLowerCase().includes(query.toLowerCase())
  );

  /*limit to 10 results*/
  return filtered.slice(0, 10).map(make => ({
    value: make.make_display,
    label: make.make_display,
  }));
}

/*search for models that match the query and optional make*/
async function searchModels(query, make = null) {
  if (!query || query.length < 1) return [];

  /*if make is provided, search models for that make*/
  let url = `${CARQUERY_API}?cmd=getModels&sold_in_us=1`;
  if (make) {
    /*get make_id first*/
    const makesRes = await fetch(`${CARQUERY_API}?cmd=getMakes&sold_in_us=1`);
    if (!makesRes.ok) return [];
    const makesData = await makesRes.json();
    const makes = makesData.Makes || [];
    const makeObj = makes.find(m => m.make_display.toLowerCase() === make.toLowerCase());
    if (makeObj) {
      url += `&make=${makeObj.make_id}`;
    }
  }

  const modelsRes = await fetch(url);
  if (!modelsRes.ok) return [];

  const modelsData = await modelsRes.json();
  const models = modelsData.Models || [];

  /*filter models that match query*/
  const filtered = models.filter(model =>
    model.model_name.toLowerCase().includes(query.toLowerCase())
  );

  /*remove duplicates and limit to 10*/
  const unique = [...new Set(filtered.map(m => m.model_name))];
  return unique.slice(0, 10).map(model => ({
    value: model,
    label: model,
  }));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); /*make model type shi*/
    const query = searchParams.get('query');
    const make = searchParams.get('make'); /*optional for model search*/

    if (!type || !query) {
      return NextResponse.json({ results: [] });
    }

    let results = [];
    if (type === 'make') {
      results = await searchMakes(query);
    } else if (type === 'model') {
      results = await searchModels(query, make);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ results: [] });
  }
}
