import { NextResponse } from 'next/server';

const CARQUERY_API = 'https://www.carqueryapi.com/api/0.3/';

export async function GET(request, { params }) {
  const { model_id } = params;
  const modelRes = await fetch(`${CARQUERY_API}?cmd=getModel&model=${model_id}`);
  const modelData = await modelRes.json();
  if (!modelData.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(modelData[0]);
}