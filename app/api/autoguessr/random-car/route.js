import { NextResponse } from 'next/server';

const CARQUERY_API = 'https://www.carqueryapi.com/api/0.3/';

/* seeded random number gen, mulberry32 algorithm*/
function seededRandom(seed) {
  return function() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

/* get seed val based on the curr date YYYYMMDD converted to a number*/
function getDailySeed() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`, 10);
}

/* get rand int within range using random func*/
function getSeededRandomInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export async function GET(request) {
  try {
    /* get seed from query param or use todays date*/
    const { searchParams } = new URL(request.url);
    const seedParam = searchParams.get('seed');
    const seed = seedParam ? parseInt(seedParam, 10) : getDailySeed();

    /* create seeded random num gen*/
    const rng = seededRandom(seed);

    /* get available years*/
    const yearsRes = await fetch(`${CARQUERY_API}?cmd=getYears`);
    if (!yearsRes.ok) {
      throw new Error('Failed to fetch years from CarQuery API');
    }
    const yearsData = await yearsRes.json();
    const minYear = parseInt(yearsData.Years.min_year, 10);
    const maxYear = parseInt(yearsData.Years.max_year, 10);
    const year = getSeededRandomInt(minYear, maxYear, rng);

    /* get makes for that year*/
    const makesRes = await fetch(`${CARQUERY_API}?cmd=getMakes&year=${year}&sold_in_us=1`);
    if (!makesRes.ok) {
      throw new Error('Failed to fetch makes from CarQuery API');
    }
    const makesData = await makesRes.json();
    const makes = makesData.Makes;
    if (!makes || !makes.length) {
      return NextResponse.json({ error: 'No makes found for selected year' }, { status: 404 });
    }
    const makeIndex = Math.floor(rng() * makes.length);
    const make = makes[makeIndex];

    /* get models for that make/year*/
    const modelsRes = await fetch(`${CARQUERY_API}?cmd=getModels&make=${make.make_id}&year=${year}&sold_in_us=1`);
    if (!modelsRes.ok) {
      throw new Error('Failed to fetch models from CarQuery API');
    }
    const modelsData = await modelsRes.json();
    const models = modelsData.Models;
    if (!models || !models.length) {
      return NextResponse.json({ error: 'No models found for selected make/year' }, { status: 404 });
    }
    const modelIndex = Math.floor(rng() * models.length);
    const model = models[modelIndex];

    /* get trims for that model/year to get model_id*/
    const trimsRes = await fetch(`${CARQUERY_API}?cmd=getTrims&make=${make.make_id}&model=${model.model_name}&year=${year}&sold_in_us=1`);
    if (!trimsRes.ok) {
      throw new Error('Failed to fetch trims from CarQuery API');
    }
    const trimsData = await trimsRes.json();
    const trims = trimsData.Trims;
    if (!trims || !trims.length) {
      return NextResponse.json({ error: 'No trims found for selected model' }, { status: 404 });
    }
    const trimIndex = Math.floor(rng() * trims.length);
    const trim = trims[trimIndex];

    /* return basic info with seed for debugging*/
    return NextResponse.json({
      model_id: trim.model_id,
      make: trim.model_make_id,
      model: trim.model_name,
      year: trim.model_year,
      seed: seed,
    });
  } catch (error) {
    console.error('Error in random-car API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random car', details: error.message },
      { status: 500 }
    );
  }
}