"""Prepare local, attributed assets for the orbital-to-campus journey.
Earth maps: Solar System Scope (CC BY 4.0). Regional imagery: EOX Sentinel-2
cloudless 2016 (CC BY 4.0). These are downloaded once, not requested by visitors.
"""
from pathlib import Path
from io import BytesIO
import json, urllib.request, urllib.parse, concurrent.futures
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/location'
RAW = ROOT / 'assets-originals/location'
OUT.mkdir(parents=True, exist_ok=True)
RAW.mkdir(parents=True, exist_ok=True)

MAPS = [
    ('earth-day', '8k_earth_daymap.jpg', (4096,2048), 90),
    ('earth-night', '2k_earth_nightmap.jpg', (2048,1024), 87),
    ('earth-clouds', '2k_earth_clouds.jpg', (2048,1024), 86),
    ('earth-normal', '2k_earth_normal_map.tif', (2048,1024), 88),
    ('earth-specular', '2k_earth_specular_map.tif', (1024,512), 90),
    ('sun', '2k_sun.jpg', (2048,1024), 90),
    ('mercury', '2k_mercury.jpg', (1024,512), 90),
    ('venus', '2k_venus_atmosphere.jpg', (1024,512), 90),
    ('mars', '2k_mars.jpg', (1024,512), 90),
    ('jupiter', '2k_jupiter.jpg', (1536,768), 90),
    ('saturn', '2k_saturn.jpg', (1536,768), 90),
    ('uranus', '2k_uranus.jpg', (1024,512), 90),
    ('neptune', '2k_neptune.jpg', (1024,512), 90),
    ('saturn-rings', '2k_saturn_ring_alpha.png', (1024,63), 90),
]
REGIONS = [
    ('india', [55,-4,105,42], 2048),
    ('tamil-nadu', [72,5,85,18], 2048),
    ('vellore', [78.4,12.25,79.9,13.65], 2048),
    ('campus', [79.113,12.929,79.20,13.013], 1536),
]

def get(url):
    request=urllib.request.Request(url,headers={'User-Agent':'RishabhPortfolioAssetBuilder/1.0'})
    with urllib.request.urlopen(request,timeout=100) as response:
        return response.read()

def planet(item):
    name, filename, size, quality=item
    url='https://www.solarsystemscope.com/textures/download/'+filename
    raw=RAW/filename
    if not raw.exists():raw.write_bytes(get(url))
    image=Image.open(raw).convert('RGBA' if name=='saturn-rings' else 'RGB').resize(size,Image.Resampling.LANCZOS)
    if name=='earth-clouds':
        alpha=image.convert('L');image=Image.new('RGBA',size,(255,255,255,0));image.putalpha(alpha)
    image.save(OUT/(name+'.webp'),'WEBP',quality=quality,method=6)
    print(name,size,(OUT/(name+'.webp')).stat().st_size,flush=True)
    return {'file':name+'.webp','source':url,'author':'Solar System Scope','license':'CC BY 4.0','changes':'Resized/compressed for browser use; cloud luminance converted to alpha.'}

def region(item):
    name,bounds,size=item
    if name == 'india':
        image=Image.open(RAW/'8k_earth_daymap.jpg').convert('RGB');w,h=image.size
        west,south,east,north=bounds
        image=image.crop(((west+180)/360*w,(90-north)/180*h,(east+180)/360*w,(90-south)/180*h)).resize((size,size),Image.Resampling.LANCZOS)
        image.save(OUT/'india.webp','WEBP',quality=92,method=6)
        return {'file':'india.webp','bounds':bounds,'projection':'EPSG:4326','source':'https://www.solarsystemscope.com/textures/download/8k_earth_daymap.jpg','author':'Solar System Scope','license':'CC BY 4.0','changes':'Geographic crop of the global day map for a seam-free globe-to-India transition.'}
    parameters={'service':'WMS','version':'1.1.1','request':'GetMap','layers':'s2cloudless','styles':'','srs':'EPSG:4326','bbox':','.join(str(x)for x in bounds),'width':size,'height':size,'format':'image/jpeg'}
    url='https://tiles.maps.eox.at/wms?'+urllib.parse.urlencode(parameters)
    raw=RAW/(name+'-sentinel.jpg')
    if not raw.exists():raw.write_bytes(get(url))
    image=Image.open(raw).convert('RGB');image.save(OUT/(name+'.webp'),'WEBP',quality=89,method=6)
    print(name,image.size,(OUT/(name+'.webp')).stat().st_size,flush=True)
    return {'file':name+'.webp','bounds':bounds,'projection':'EPSG:4326','source':url,'author':'EOX IT Services GmbH','license':'CC BY 4.0','attribution':'Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)','changes':'Fixed regional crops, reprojected by WMS and compressed to WebP.'}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    sources=list(pool.map(planet,MAPS))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    sources+=list(pool.map(region,REGIONS))
Image.open(ROOT.parent/'uploads/image-1.png').convert('RGB').save(OUT/'vit-main-gate.webp','WEBP',quality=97,method=6)
sources.append({'file':'vit-main-gate.webp','source':'User-provided image-1.png','changes':'Format conversion only; no generated or altered architecture.'})
(OUT/'sources.json').write_text(json.dumps(sources,indent=2))
(OUT/'LICENSE.txt').write_text('Planetary textures: Solar System Scope, https://www.solarsystemscope.com/textures/ — CC BY 4.0.\nRegional imagery: Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017) — CC BY 4.0.\nRegional imagery is a historical, cloudless mosaic, not live imagery.\nLicense: https://creativecommons.org/licenses/by/4.0/\nGate photo supplied by the user; converted to WebP without content edits.\nSee sources.json for individual source URLs and modifications.\n')
print('Location assets prepared.')
