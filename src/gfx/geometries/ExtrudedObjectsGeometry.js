import * as THREE from 'three';
import utils from '../../utils';
import ChunkedObjectsGeometry from './ChunkedObjectsGeometry';

const VEC_SIZE = 3;
const TRI_SIZE = 3;
const tmpPrev = new THREE.Vector3();
const tmpNext = new THREE.Vector3();

function _createExtrudedChunkGeometry(shape, ringsCount) {
  const geo = new THREE.BufferGeometry();
  const ptsCount = shape.length;
  const totalPts = ptsCount * ringsCount;
  const type = totalPts <= 65536 ? Uint16Array : Uint32Array;
  const facesPerChunk = (ringsCount - 1) * ptsCount * 2;
  const indices = new THREE.BufferAttribute(utils.allocateTyped(type, facesPerChunk * TRI_SIZE), 1);

  let currVtxIdx = 0;
  let currFaceIdx = 0;
  for (let y = 0; y < ringsCount; y++) {
    // faces
    if (y !== ringsCount - 1) {
      for (let i = 0; i < ptsCount; i++) {
        const v1 = currVtxIdx + i;
        const v2 = currVtxIdx + ptsCount + i;
        const v3 = currVtxIdx + ptsCount + ((i + 1) % ptsCount);
        const v4 = currVtxIdx + ((i + 1) % ptsCount);

        indices.setXYZ(currFaceIdx * TRI_SIZE, v1, v4, v2);
        currFaceIdx++;
        indices.setXYZ(currFaceIdx * TRI_SIZE, v2, v4, v3);
        currFaceIdx++;
      }
    }

    currVtxIdx += ptsCount;
  }

  geo.setIndex(indices);
  const pos = utils.allocateTyped(Float32Array, totalPts * VEC_SIZE);
  geo.addAttribute('position', new THREE.BufferAttribute(pos, VEC_SIZE));

  geo._positions = shape;

  return geo;
}

class ExtrudedObjectsGeometry extends ChunkedObjectsGeometry {
  constructor(shape, ringsCount, chunksCount) {
    const chunkGeo = _createExtrudedChunkGeometry(shape, ringsCount);
    super(chunkGeo, chunksCount);
    this._ringsCount = ringsCount;

    const tmpShape = this._tmpShape = [];
    for (let i = 0; i < shape.length; ++i) {
      tmpShape[i] = new THREE.Vector3();
    }
  }

  _setPoints(matrices, ptsCount, chunkStartIdx, hasCut) {
    const tmpShape = this._tmpShape;
    const positions = this._positions;
    const shape = this._chunkGeo._positions;

    let innerPtIdx = 0;
    const nPtsInRing = ptsCount * VEC_SIZE;

    for (let i = 0, n = matrices.length; i < n; ++i) {
      const mtx = matrices[i];

      for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
        const vtxIdx = chunkStartIdx + innerPtIdx;

        tmpShape[j].copy(shape[j]).applyMatrix4(mtx);
        tmpShape[j].toArray(positions, vtxIdx);

        if (hasCut && i === 2) {
          positions[vtxIdx] = positions[vtxIdx - nPtsInRing];
          positions[vtxIdx + 1] = positions[vtxIdx - nPtsInRing + 1];
          positions[vtxIdx + 2] = positions[vtxIdx - nPtsInRing + 2];
        }
      }
    }
  }

  _setBaseNormals(ptsCount, chunkStartIdx, hasCut) {
    const normals = this._normals;
    const tmpShape = this._tmpShape;

    let innerPtIdx = 0;
    for (let i = 0; i < this._ringsCount; ++i) {
      for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
        const vtxIdx = chunkStartIdx + innerPtIdx;
        tmpShape[j].fromArray(this._positions, vtxIdx);
      }
      innerPtIdx = i * (ptsCount * 3);
      for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
        const vtxIdx = chunkStartIdx + innerPtIdx;

        tmpPrev.subVectors(tmpShape[j], tmpShape[(j + ptsCount - 1) % ptsCount]).normalize();
        tmpNext.subVectors(tmpShape[j], tmpShape[(j + 1) % ptsCount]).normalize();
        new THREE.Vector3().addVectors(tmpPrev, tmpNext).normalize().toArray(normals, vtxIdx);
      }
    }
  }

  _setSlopeNormals(ptsCount, chunkStartIdx, hasCut) {
    const normals = this._normals;
    const tmpShape = this._tmpShape;

    let innerPtIdx = 0;
    for (let i = 0; i < this._ringsCount; ++i) {
      if (hasCut && i === 0) {
        for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
          const vtxIdx = chunkStartIdx + innerPtIdx;
          tmpShape[j].fromArray(this._positions, vtxIdx);
        }
        innerPtIdx = i * (ptsCount * 3);
        for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
          const vtxIdx = chunkStartIdx + innerPtIdx;

          tmpPrev.subVectors(tmpShape[j], tmpShape[(j + ptsCount - 1) % ptsCount]).normalize();
          tmpNext.subVectors(tmpShape[j], tmpShape[(j + 1) % ptsCount]).normalize();
          new THREE.Vector3().crossVectors(tmpNext, tmpPrev).normalize().toArray(normals, vtxIdx);
        }
        continue;
      }
      if (hasCut && i === 1) {
        for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
          const vtxIdx = chunkStartIdx + innerPtIdx;
          new THREE.Vector3().fromArray(normals, vtxIdx - ptsCount * 3).toArray(normals, vtxIdx);
        }
        continue;
      }
      if (i === 1) {
        for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
          const vtxIdx = chunkStartIdx + innerPtIdx;
          new THREE.Vector3().fromArray(normals, vtxIdx - 2 * ptsCount * 3).toArray(normals, vtxIdx);
        }
        continue;
      }
      for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
        const vtxIdx = chunkStartIdx + innerPtIdx;
        tmpShape[j].fromArray(this._positions, vtxIdx);
      }
      innerPtIdx = i * (ptsCount * 3);
      for (let j = 0; j < ptsCount; ++j, innerPtIdx += VEC_SIZE) {
        const vtxIdx = chunkStartIdx + innerPtIdx;
        const prevRingPt = new THREE.Vector3().fromArray(this._positions, vtxIdx - ptsCount * 3);

        tmpPrev.subVectors(tmpShape[(j + ptsCount - 1) % ptsCount], tmpShape[(j + 1) % ptsCount]).normalize();
        tmpNext.subVectors(tmpShape[j], prevRingPt).normalize();
        new THREE.Vector3().crossVectors(tmpPrev, tmpNext).normalize().toArray(normals, vtxIdx);
      }
    }
  }

  setItem(itemIdx, matrices, hasSlope = false, hasCut = false) {
    const ptsCount = this._chunkGeo._positions.length;
    const chunkStartIdx = ptsCount * this._ringsCount * itemIdx * VEC_SIZE;

    this._setPoints(matrices, ptsCount, chunkStartIdx, hasCut);
    if (hasSlope) {
      this._setSlopeNormals(ptsCount, chunkStartIdx, hasCut);
    } else {
      this._setBaseNormals(ptsCount, chunkStartIdx, hasCut);
    }
  }

  // Counting normals:
  // - No slope
  //   Radius doesn't change throught part => normals are parallel with the plane contains section points
  //   normal = vToPrevPointInSection + vToNextPointInSection (all vectors are scaled for being 1 in length)
  // - Slope
  //   Radius changes throught part => normals aren't parallel with the plane contains section points
  //   normal = vTangentInSectionPlane x vToSuchPointInPrevSection (all vectors are scaled for being 1 in length)

  _countNormals(point, nextPt, prevPt, prevRingPt, prevPrevRingNormal, isFirstRing, hasSlope) {
    if (hasSlope) {
      if (isFirstRing) {
        // first section is equal to last section of previous part so we takes normals from it
        return prevPrevRingNormal;
      }
      // zero and first sections are equal so we will have tmpNext = 0 for the first section
      // so we count normals with another way for it
      tmpPrev.subVectors(prevPt, nextPt).normalize();
      tmpNext.subVectors(point, prevRingPt).normalize();
      return new THREE.Vector3().crossVectors(tmpPrev, tmpNext).normalize();
    }

    tmpPrev.subVectors(point, prevPt).normalize();
    tmpNext.subVectors(point, nextPt).normalize();
    return new THREE.Vector3().addVectors(tmpPrev, tmpNext).normalize();
  }
}

export default ExtrudedObjectsGeometry;
