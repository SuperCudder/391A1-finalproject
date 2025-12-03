import { NextResponse } from 'next/server';

const CARQUERY_API = 'https://www.carqueryapi.com/api/0.3/';

export async function GET() {
  // Get available years
  const yearsRes = await fetch(`${CARQUERY_API}?cmd=getYears`);
  const yearsData = await yearsRes.json();
  const minYear = parseInt(yearsData.Years.min_year, 10);
  const maxYear = parseInt(yearsData.Years.max_year, 10);
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;

  // Get makes for that year
  const makesRes = await fetch(`${CARQUERY_API}?cmd=getMakes&year=${year}&sold_in_us=1`);
  const makesData = await makesRes.json();
  const makes = makesData.Makes;
  if (!makes.length) return NextResponse.json({ error: 'No makes found' }, { status: 404 });
  const make = makes[Math.floor(Math.random() * makes.length)];

  // Get models for that make/year
  const modelsRes = await fetch(`${CARQUERY_API}?cmd=getModels&make=${make.make_id}&year=${year}&sold_in_us=1`);
  const modelsData = await modelsRes.json();
  const models = modelsData.Models;
  if (!models.length) return NextResponse.json({ error: 'No models found' }, { status: 404 });
  const model = models[Math.floor(Math.random() * models.length)];

  // Get trims for that model/year (to get model_id)
  const trimsRes = await fetch(`${CARQUERY_API}?cmd=getTrims&make=${make.make_id}&model=${model.model_name}&year=${year}&sold_in_us=1`);
  const trimsData = await trimsRes.json();
  const trims = trimsData.Trims;
  if (!trims.length) return NextResponse.json({ error: 'No trims found' }, { status: 404 });
  const trim = trims[Math.floor(Math.random() * trims.length)];

  // Return basic info (no trim name needed)
  return NextResponse.json({
    model_id: trim.model_id,
    make: trim.model_make_id,
    model: trim.model_name,
    year: trim.model_year,
  });
}