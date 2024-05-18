import axios from 'axios';

const DB_API = import.meta.env.VITE_DB_API_URL;
const INFERENCE_SPOT_API = import.meta.env.VITE_INFERENCE_SPOT_API_URL;
const INFERENCE_SERVERLESS_API = import.meta.env
  .VITE_INFERENCE_SERVERLESS_API_URL;
const MODEL_PROFILE_API = import.meta.env.VITE_MODEL_PROFILE_API_URL;
const USER_TRAIN_API = import.meta.env.VITE_USER_TRAIN_API_URL;
const STREAMLIT_API = import.meta.env.VITE_STREAMLIT_API_URL;

// Model
export const createModel = async (args) => {
  const res = await axios.post(`${DB_API}/models`, args).catch((err) => err);
  return res?.data?.model;
};

export const updateModel = async (uid, args) => {
  const res = await axios
    .put(`${DB_API}/models/${uid}`, args)
    .catch((err) => err);
  return res?.data?.model;
};

export const getModel = async (uid) => {
  const res = await axios.get(`${DB_API}/models/${uid}`).catch((err) => err);
  return res?.data;
};

export const getModels = async (user_uid) => {
  const res = await axios
    .get(`${DB_API}/models`, {
      headers: {
        user: user_uid
      }
    })
    .catch((err) => err);
  return res?.data;
};

export const deleteModel = async (uid) => {
  const res = await axios.delete(`${DB_API}/models/${uid}`);
  return res?.data;
};

export const profileModel = async (uid) => {
  const res = await axios
    .post(`${MODEL_PROFILE_API}`, {
      uid
    })
    .catch((err) => err);
};

// Data
export const getData = async (user_uid) => {
  const res = await axios
    .get(`${DB_API}/data`, {
      headers: {
        user: user_uid
      }
    })
    .catch((err) => err);
  return res?.data;
};

export const createData = async (args) => {
  const res = await axios.post(`${DB_API}/data`, args).catch((err) => err);
  return res?.data?.data;
};

export const updateData = async (uid, args) => {
  const res = await axios
    .put(`${DB_API}/data/${uid}`, args)
    .catch((err) => err);
  return res?.data?.data;
};

export const deleteData = async (uid) => {
  const res = await axios.delete(`${DB_API}/data/${uid}`).catch((err) => err);
  return res?.data;
};

// Trains
export const getTrains = async (user_uid) => {
  const res = await axios
    .get(`${DB_API}/trains`, {
      headers: {
        user: user_uid
      }
    })
    .catch((err) => err);
  return res?.data;
};

export const createUserTrain = async (args) => {
  const res = await axios
    .post(`${DB_API}/trains`, {
      user: args.user,
      name: args.name,
      model: args.model.uid,
      data: args.data.uid,
      epoch_num: args.epochNum,
      learning_rate: args.learningRate,
      optim_str: args.optimStr,
      loss_str: args.lossStr,
      train_split_size: args.trainSplitSize,
      batch_size: args.batchSize,
      worker_num: args.workerNum
    })
    .catch((err) => err);

  if (!res?.data) {
    console.log(res);
    return false;
  }

  const { train } = res.data;

  const uploaded = await uploadS3(
    'data_loader',
    args.user,
    train.uid,
    args.dataLoader
  );

  if (!uploaded) return false;

  await axios
    .put(`${DB_API}/trains/${train.uid}`, {
      data_loader_path: uploaded
    })
    .catch((err) => err);

  const model = await createModel({
    user: args.user,
    name: args.name,
    type: 'user',
    input_shape: args.model.input_shape,
    value_type: args.model.value_type,
    value_range: args.model.value_range,
    deployment_type: args.model.deployment_type,
    max_used_ram: args.model.max_used_ram,
    max_used_gpu_ram: args.model.max_used_gpu_ram,
    inference_time: args.model.inference_time
  }).catch((err) => err);

  if (!model) return false;

  await axios
    .post(USER_TRAIN_API, {
      epoch_num: args.epochNum,
      learning_rate: args.learningRate,
      train_split_size: args.trainSplitSize,
      batch_size: args.batchSize,
      worker_num: args.workerNum,
      optim_str: args.optimStr,
      loss_str: args.lossStr,
      uid: train.uid,
      user_uid: args.user,
      model_uid: model.uid,
      model_s3_url: args.model.s3_url,
      data_s3_url: args.data.s3_url,
      data_load_s3_url: uploaded,
      ram_size: args.model.max_used_ram,
      action: 'create'
    })
    .catch((err) => err);

  return model;
};

export const deleteTrain = async (uid, status) => {
  if (status !== 'Completed')
    await axios
      .post(USER_TRAIN_API, {
        action: 'delete',
        uid
      })
      .catch((err) => err);

  await axios.delete(`${DB_API}/trains/${uid}`);
};

// Inferences
export const createSpotInference = async (args) => {
  const res = await axios
    .post(`${DB_API}/inferences`, {
      user: args.user,
      name: args.name,
      model: args.model,
      model_type: args.model_type,
      type: args.type
    })
    .catch((err) => err);

  if (!res?.data) {
    console.error(res);
    return false;
  }

  const { Item } = res.data.inference;

  const spot = await axios
    .post(`${INFERENCE_SPOT_API}`, {
      uid: Item.uid,
      user: args.user,
      action: 'create',
      model: args.model_detail
    })
    .catch((err) => err);

  if (spot.status !== 200) {
    await axios.delete(`${DB_API}/inferences/${Item.uid}`);
    return false;
  }

  return Item;
};

export const deleteSpotInference = async (args) => {
  const spot = await axios
    .post(`${INFERENCE_SPOT_API}`, {
      uid: args.uid,
      user: args.user,
      action: 'delete'
    })
    .catch((err) => err);

  return spot.status === 200;
};

export const updateInference = async (uid, args) => {
  const res = await axios
    .put(`${DB_API}/inferences/${uid}`, args)
    .catch((err) => err);

  return res?.data;
};

export const createServerlessInference = async (args) => {
  const res = await axios
    .post(`${DB_API}/inferences`, {
      user: args.user,
      name: args.name,
      model: args.model,
      model_type: args.model_type,
      type: args.type
    })
    .catch((err) => err);

  if (!res?.data) {
    console.error(res);
    return false;
  }

  const { Item } = res.data.inference;

  const serverless = await axios
    .post(`${INFERENCE_SERVERLESS_API}`, {
      uid: Item.uid,
      user: args.user,
      action: 'create',
      model: args.model_detail
    })
    .catch((err) => err);

  if (serverless.status !== 200) {
    await axios.delete(`${DB_API}/inferences/${Item.uid}`);
    return false;
  }

  return Item;
};

export const deleteServerlessInference = async (args) => {
  const model = await getModel(args.model);
  if (!model) return false;
  const serverless = await axios
    .post(`${INFERENCE_SERVERLESS_API}`, {
      uid: args.uid,
      user: args.user,
      action: 'delete',
      model: {
        s3_url: model.s3_url,
        max_used_ram: model.max_used_ram || 5120
      }
    })
    .catch((err) => err);

  return serverless.status === 200;
};

export const getInferences = async (user_uid) => {
  const res = await axios
    .get(`${DB_API}/inferences`, {
      headers: {
        user: user_uid
      }
    })
    .catch((err) => err);
  return res?.data;
};

export const manageStreamlit = async ({
  user,
  uid,
  model_type,
  endpoint_url,
  action
}) => {
  const res = await axios
    .post(STREAMLIT_API, {
      user,
      uid,
      action,
      model_type,
      endpoint_url
    })
    .catch((err) => err);
  return res.status === 200;
};

// Upload Files (Model / Data)
export const uploadS3 = async (upload_type, user_uid, uid, file) => {
  const res = await axios
    .post(`${DB_API}/upload`, {
      upload_type,
      user_uid,
      uid,
      filename: file.name
    })
    .catch((err) => err);

  if (!res?.data) {
    console.error(res);
    return false;
  }
  const upload = await axios
    .put(res.data.url, file, {
      headers: {
        'Content-Type': file.type
      }
    })
    .catch((err) => err);
  if (!upload || upload.status !== 200) {
    console.error(res);
    return false;
  }

  return res.data.url.split('?')[0];
};

export const uploadS3Multipart = async (upload_type, user_uid, uid, file) => {
  const args = {
    upload_type,
    user_uid,
    uid,
    filename: file.name
  };
  const res = await axios
    .post(`${DB_API}/upload/start`, args)
    .catch((err) => err);

  const { UploadId } = res?.data;

  if (!UploadId) {
    console.error(res);
    return false;
  }

  const CHUNK_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
  const totalChunk = Math.floor(file.size / CHUNK_SIZE) + 1;
  const chunkPromises = [];

  for (let index = 1; index <= totalChunk; index++) {
    const start = (index - 1) * CHUNK_SIZE;
    const end = index * CHUNK_SIZE;
    const chunk =
      index < totalChunk ? file.slice(start, end) : file.slice(start);

    const presigned = await axios.post(`${DB_API}/upload/url`, {
      ...args,
      UploadId,
      PartNumber: index
    });

    const url = presigned.data;

    if (!url) {
      console.error(url);
      return false;
    }

    const upload = axios.put(url, chunk, {
      headers: {
        'Content-type': file.type
      }
    });
    chunkPromises.push(upload);
  }

  const resolved = await Promise.all(chunkPromises);
  const Parts = [];

  resolved.forEach((promise, index) => {
    Parts.push({
      ETag: promise.headers.etag,
      PartNumber: index + 1
    });
  });

  const completed = await axios.post(`${DB_API}/upload/complete`, {
    ...args,
    UploadId,
    Parts
  });

  if (completed.status !== 200) {
    console.err(completed);
    return false;
  }

  return true;
};