from flask import Flask, request
from flask import jsonify
# from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler #,normalize, StandardScaler, FunctionTransformer
from concurrent.futures import ThreadPoolExecutor
from scipy.ndimage import gaussian_filter
from scipy.signal import savgol_filter
# from spectral import envi, imshow, view_cube
import shutil
import os
os.umask(0)
import spectral as sp
from werkzeug.utils import secure_filename
import json
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from flask_cors import CORS, cross_origin
from itertools import product

app = Flask(__name__)
CORS(app, origins='*')
# app.config['CORS_HEADERS'] = 'Content-Type'
data= []
filter_data= []
bands= []
dataID_mouted= -1
mounted_data_path= ""

UPLOAD_FOLDER = 'Spectral_data/Data'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# print("Current dir:  ", os.getcwd())



def get_patients_files(dt_id, names_paths):
    temp_dict= dict()
    temp_dict["ID"]= dt_id
    dir_path= os.path.join(app.config['UPLOAD_FOLDER'], dt_id)
    dir_inside= os.listdir(dir_path)
    temp_dict["data_name"]= dir_inside[0]
    dir_path= os.path.join(dir_path, dir_inside[0])
    files = os.listdir(dir_path)
    hdr_file_name = [file for file in files if file.endswith('.hdr')][0]
    dt_file_name = [file for file in files if (not file.endswith('.hdr') and not file.endswith('filters'))][0]
    if (names_paths == "names"):
        temp_dict["header"]= hdr_file_name
        temp_dict["data"]= dt_file_name
    elif (names_paths == "paths"):
        temp_dict["header"]= os.path.join(dir_path, hdr_file_name)
        temp_dict["data"]= os.path.join(dir_path, dt_file_name)
    return temp_dict

def check_data_name(name):
    dirs= os.listdir(app.config['UPLOAD_FOLDER'])
    for dir_ in dirs:
        data_name= os.path.join(app.config['UPLOAD_FOLDER'], dir_, name)
        if os.path.exists(data_name):
            return True
    return False


def get_filter_file(filter_type, filter_id):
    if (filter_type == "gs"):
        filter_dir= os.path.join(mounted_data_path, "filters", "gaussian")
    elif (filter_type == "sv"):
        filter_dir= os.path.join(mounted_data_path, "filters", "savgol")
    entries = os.listdir(filter_dir)
    for s in entries:
        parts = s.split('_')
        if parts[0] == filter_id:
            return os.path.join(filter_dir, s)

    return None


def inflect(x, wavelengths, threshold):
    up = np.column_stack([np.concatenate((x[n:], [np.nan] * n)) for n in range(1, threshold + 1)])
    down = np.column_stack([np.concatenate(([np.nan] * abs(n), x[:-abs(n)])) for n in range(-1, -threshold - 1, -1)])
    a = np.column_stack((x, up, down))

    minima_indices = np.where(np.min(a, axis=1) == a[:, 0])[0]
    maxima_indices = np.where(np.max(a, axis=1) == a[:, 0])[0]
    minima_wavelengths = wavelengths[minima_indices]
    maxima_wavelengths = wavelengths[maxima_indices]

    global data
    minima_data= []
    maxima_data= []
    for i in range(len(minima_indices)):
        minima_data.append(data[:,:, i].squeeze().tolist())
    
    for i in range(len(maxima_indices)):
        maxima_data.append(data[:,:, i].squeeze().tolist())

    return {
        'minima_indices': minima_indices.tolist(),
        'maxima_indices': maxima_indices.tolist(),
        'minima_wavelengths': minima_wavelengths.tolist(),
        'maxima_wavelengths': maxima_wavelengths.tolist(),
        'minima_data': minima_data,
        'maxima_data': maxima_data
    }


@app.route('/mout_filter/<filter_id>/<filter_type>', methods=['POST', 'GET'])
def mout_filter(filter_id, filter_type):
    filter_path= get_filter_file(filter_type, filter_id)
    global filter_data
    filter_data= np.load(filter_path)
    return str(filter_path)


@app.route('/run_filter', methods=['POST', 'GET'])
def run_filter():
    data_dic= request.get_json()
    filter= data_dic["selected_filter"]
    global data
    
    filter_dir= os.path.join(mounted_data_path, "filters")
    # os.makedirs(os.path.join(filter_dir, filter), mode=0o777)
    if (filter == "gs"):
        sigma= data_dic["sigma"]
        filtred_data= gaus_filter(data, int(sigma))

        filter_dirpath= os.path.join(filter_dir, "gaussian")
        selected_ID= getFilterID(filter_dirpath)
        filter_path= os.path.join(filter_dirpath, str(selected_ID) + "_" + sigma + ".npy")
        np.save(filter_path, filtred_data)

    elif (filter == "sv"):
        window_length= data_dic["window_length"]
        polyorder= data_dic["polyorder"]
        filtred_data= savg_filter(data, int(window_length), int(polyorder))

        filter_dirpath= os.path.join(filter_dir, "savgol")
        selected_ID= getFilterID(filter_dirpath)
        filter_path= os.path.join(filter_dirpath, str(selected_ID) + "_" + window_length + "_" + polyorder +".npy")
        np.save(filter_path, filtred_data)
    return "ok"


@app.route('/band_ratio', methods=['POST', 'GET'])
def band_ratio():
    yMean= np.array(json.loads(request.form["yMean"]))
    threshold= request.form["threshold"]
    global bands
    result= inflect(yMean, np.array(bands), int(threshold))
    return jsonify(result)

    # return "ok" 

def gaus_filter(slice_data, sigma_):
    def apply_gaussian_filter(slice_data):
        return gaussian_filter(slice_data, sigma=sigma_)
    # gaussian_filter_data_cube = gaussian_filter(data, sigma=(0, 0, sigma_))
    with ThreadPoolExecutor() as executor:
        results = list(executor.map(apply_gaussian_filter, [data[:, :, i] for i in range(data.shape[2])]))
    results=np.squeeze(np.stack(results, axis=2), axis=-1)
    return results



def savg_filter(data_cube, window_length, polyorder):
    # Use ThreadPoolExecutor to parallelize the operation
    with ThreadPoolExecutor() as executor:
        results = list(executor.map(
            lambda slice_data: savgol_filter(slice_data, window_length, polyorder, axis=0),
            [data_cube[:, :, i] for i in range(data_cube.shape[2])]
        ))
    # Stack the results back into a 3D array
    return np.squeeze(np.stack(results, axis=2), axis=-1)

    

@app.route('/isMounted', methods=['GET','POST'])
def isMounted():
    # print(mounted_data_path.split("/")[-1])
    global data, dataID_mouted
    if len(data) == 0:
        return {"isMounted": False, "dataID_mouted": dataID_mouted}
    return {"isMounted": True, "dataID_mouted": dataID_mouted, "dataName_mouted": mounted_data_path.split("/")[-1]}


def getFilterID(dir_path):
    data_ID = [item for item in os.listdir(dir_path)]
    if len(data_ID)==0:
        data_ID = 1
    else:
        data_ID = max([int(item.split('_')[0]) for item in os.listdir(dir_path)]) +1
    return data_ID

def getID(dir_path):
    data_ID = [int(num) for num in os.listdir(dir_path)]
    if len(data_ID)==0:
        data_ID = 1
    else:
        data_ID = max([int(num) for num in os.listdir(dir_path)]) +1
    return data_ID

@app.route('/upload', methods=['POST'])
def upload_file():
    data_name = request.form['data_name']
    name_exist= check_data_name(data_name)

    if name_exist:
        return jsonify({"status": "error", "message": "This name already exists"})
    
    data_ID = getID(app.config['UPLOAD_FOLDER'])
    data_path= os.path.join(app.config['UPLOAD_FOLDER'], str(data_ID), data_name)
    os.makedirs(data_path, mode=0o777)
    os.makedirs(os.path.join(data_path, "filters"), mode=0o777)
    os.makedirs(os.path.join(data_path, "filters", "gaussian"), mode=0o777)
    os.makedirs(os.path.join(data_path, "filters", "savgol"), mode=0o777)
    os.makedirs(os.path.join(data_path, "filters", "median"), mode=0o777)

    hd_file = request.files['hdFile']
    hd_path= os.path.join(data_path, hd_file.filename)
    hd_file.save(hd_path)

    dt_file = request.files['dataFile']
    dt_path= os.path.join(data_path, dt_file.filename)
    dt_file.save(dt_path)

    return jsonify({"status": "ok", "message": "Upload seccuss"})

def get_filter_params(filter, filter_type):
    params_dict= dict()
    if (filter_type == "gs"):
        params= filter.split("_")
        params_dict["id"]= params[0]
        params_dict["sigma"]= params[1].split(".")[0]
    elif (filter_type == "sv"):
        params= filter.split("_")
        params_dict["id"]= params[0]
        params_dict["window_length"]= params[1]
        params_dict["polyorder"]= params[2].split(".")[0]
    return params_dict
    


@app.route('/list_filters/<filter_name>', methods=['GET'])
def list_filters(filter_name):
    global mounted_data_path
    filters_dir= os.path.join(mounted_data_path, "filters")
    if (filter_name == "gs"):
        filters_dir= os.path.join(mounted_data_path, "filters", "gaussian")
    elif (filter_name == "sv"):
        filters_dir= os.path.join(mounted_data_path, "filters", "savgol")
    else:
        return "ok"

    filters = os.listdir(filters_dir)
    filters.sort(key=lambda x: os.path.getmtime(os.path.join(filters_dir, x)), reverse=True)
    dir_list= []

    for filter in filters:
        filter_params= get_filter_params(filter, filter_name)
        dir_list.append(filter_params)
    return [filter_name, dir_list]

@app.route('/list_data', methods=['GET'])
def list_patients():
    patients = os.listdir(app.config['UPLOAD_FOLDER'])
    patients.sort(key=lambda x: os.path.getmtime(os.path.join(app.config['UPLOAD_FOLDER'], x)), reverse=True)
    dir_list= []
    for dir in patients:
        temp_dict= get_patients_files(dir, "names")
        dir_list.append(temp_dict)
    return dir_list

@app.route('/delete_filter/<data_id>/<filter_id>/<filter_type>', methods=['GET'])
def delete_filter(data_id, filter_id, filter_type):
    dir_path= os.path.join(app.config['UPLOAD_FOLDER'], data_id)
    filters_path= os.path.join(dir_path, os.listdir(dir_path)[0], "filters")
    if (filter_type == "gs"):
        filter_path= os.path.join(filters_path, "gaussian")
    elif (filter_type == "sv"):
        filter_path= os.path.join(filters_path, "savgol")
    files= os.listdir(filter_path)

    for file in files:
        if (file.split("_")[0] == filter_id):
            os.remove(os.path.join(filter_path, file))
    

    return "ok"

@app.route('/delete_data_folder/<data_id>', methods=['GET'])
def delete_patient_folder(data_id):
    data_folder= os.path.join(app.config['UPLOAD_FOLDER'], data_id)
    shutil.rmtree(data_folder)
    return "ok"

@app.route('/mount_data', methods=['GET','POST'])
def mount_data():
    data_id = request.form['data_id']
    paths= get_patients_files(data_id, "paths")
    header_file = paths["header"]
    # print(header_file)
    img = sp.open_image(header_file)
    global data, bands, dataID_mouted, mounted_data_path
    data= img.load()
    bands= img.bands.centers
    dataID_mouted= data_id
    dir_path= os.path.join(app.config['UPLOAD_FOLDER'], dataID_mouted)
    dir_path= os.path.join(dir_path, os.listdir(dir_path)[0])
    mounted_data_path= dir_path
    return "ok"


@app.route('/test', methods=['GET'])
def test():
    return "cleverlytics"


@app.route('/band0', methods=['GET', 'POST'])
def band0():
    global data
    data__= data[:,:,0].squeeze()
    data__= json.dumps(data__.tolist())
    return data__

@app.route('/getBands', methods=['GET', 'POST'])
def getBands():
    global data
    global bands
    bands__= json.dumps(bands)
    return bands__

@app.route('/bandData/<band>')
def bandData(band):
   global data
   bandData= data[:,:, int(band)].squeeze()
   bandData= json.dumps(bandData.tolist())
   return bandData
   

@app.route('/pointWavelenghts_filter/<x>/<y>')
def pointWavelenghts_filter(x, y):
   global data, filter_data
   waveData= data[int(x), int(y), :].squeeze()
   waveData_filter= filter_data[int(x), int(y), :].squeeze()
   return {"waveData": waveData.tolist(), "waveData_filter": waveData_filter.tolist()}
#    waveData= json.dumps(waveData.tolist())
#    return waveData

@app.route('/pointWavelenghts/<x>/<y>')
def pointWavelenghts(x, y):
   global data
   waveData= data[int(x), int(y), :].squeeze()
   waveData= json.dumps(waveData.tolist())
   return waveData

@app.route('/rectLassoSelection', methods=['GET', 'POST'])
def rectLassoSelection():
    post_data= request.get_json()
    global data
    x1= round(post_data["x"][0])
    x2= round(post_data["x"][1])
    y1= round(post_data["y"][0])
    y2= round(post_data["y"][1])
    band_selected= int(post_data["band"])

    extractedData= data[x1:x2+1, y1:y2+1, :]
    pixels_waves_list= extractedData.reshape(extractedData.shape[0]*extractedData.shape[1], extractedData.shape[2])

    scaler= MinMaxScaler()
    normalized_data= scaler.fit_transform(pixels_waves_list.T).T
    # normalized_data= normalize(pixels_waves_list, axis=1)
    normalized_data= normalized_data.reshape(extractedData.shape[0], extractedData.shape[1], extractedData.shape[2])

    pixels_waves_list= remove_correlated_rows(pixels_waves_list)
    # print(pixels_selected)
    # print(pixels_waves_list.shape)
    # sim_pixels_waves_list= remove_similar_rows(extractedData.reshape(pixels_selected, extractedData.shape[2]), 1)
    # print(sim_pixels_waves_list.shape)

    dictRect= {"wavesData": pixels_waves_list.tolist(), "wavesMean":np.mean(extractedData, axis=(0, 1)).tolist(), "selectedData": (normalized_data[:,:,band_selected].squeeze()).tolist()  } 
    return json.dumps(dictRect)



@app.route('/lassoSelection', methods=['GET', 'POST'])
def lassoSelection():
    global data
    poly= request.get_json()
    points_inside_lasso= points_inside_polygon(poly)

    pixels_waves_list = np.array([])
    for point in points_inside_lasso:
        waves = data[point[0], point[1], :].squeeze()
        pixels_waves_list= np.append(pixels_waves_list, waves)

    pixels_waves_list= pixels_waves_list.reshape(len(points_inside_lasso), data.shape[2])
    meanWave= np.mean(pixels_waves_list, axis=0)
    pixels_waves_list= remove_correlated_rows(pixels_waves_list)
    dictLasso= {"wavesData": pixels_waves_list.tolist(), "wavesMean":meanWave.tolist() } 
    return json.dumps(dictLasso)



@app.route('/lineSelection', methods=['GET', 'POST'])
def lineSelection():
    post_data= request.get_json()
    global data
    x0= round(post_data["x0"])
    x1= round(post_data["x1"])
    y0= round(post_data["y0"])
    y1= round(post_data["y1"])
    band_selected= int(post_data["band"])
    
    line_points_list= get_line_points(x0, y0, x1, y1)
    pixels_waves_list = np.array([])
    for point in line_points_list:
        waves = data[point[0], point[1], :].squeeze()
        pixels_waves_list= np.append(pixels_waves_list, waves)
    pixels_waves_list= pixels_waves_list.reshape(len(line_points_list), data.shape[2])


    scaler= MinMaxScaler()
    pixels_waves_list_normalized= scaler.fit_transform(pixels_waves_list.T).T

    dictRect= {"wavesData": pixels_waves_list.tolist(), "wavesMean":np.mean(pixels_waves_list, axis=0).tolist(), "wavesXvalues": pixels_waves_list_normalized[:, band_selected].tolist() } 
    return json.dumps(dictRect)


@app.route('/loadCSV', methods=['GET', 'POST'])
def loadCSV():
    csv_file = request.files['csv_file']
    filename = secure_filename(csv_file.filename)

    # Check the file extension
    if not (filename.lower().endswith('.csv') or filename.lower().endswith('.xlsx')):
        return jsonify({"status": "error", "message": "File must be a CSV or XLSX file."})
    
    if filename.lower().endswith('.csv'):
        df= pd.read_csv(csv_file)
    elif filename.lower().endswith('.xlsx'):
        df= pd.read_excel(csv_file)
    # df= pd.read_csv(csv_file)
    # del df["Class"]
    
    return jsonify({"status": "ok", "csv_data": df.columns.to_list()})

@app.route('/run_algo', methods=['GET', 'POST'])
def run_algo():
    csv_file= request.files["csv_file"]
    df_file= pd.read_csv(csv_file)
    inputs_dict= json.loads(request.form["inputs"])
    data_to_process_dict= json.loads(request.form["data_to_process"])
    input_keys = list(inputs_dict.keys())
    input_values = list(inputs_dict.values())
    input_values= [float(x) for x in input_values]
    print(data_to_process_dict)

    
    target_spectra = [df_file[column].values for column in input_keys]
    algo= request.form["algo"]
    class_results=[]
    global data
    if (data_to_process_dict["data_type"] == "original"):
        data_to_use= data
    elif (data_to_process_dict["data_type"] == "preprocessed"):
        filter_path= get_filter_file(data_to_process_dict["filter"], data_to_process_dict["filterID"])
        data_to_use= np.load(filter_path)
    

    if (algo == "SAM"):
        class_results= sam_algo(data_to_use, target_spectra, input_values)
    elif (algo == "ML"):
        class_results= classify_max_likelihood(data_to_use, target_spectra, input_values)
    elif (algo == "MD"):
        class_results= min_distance_classification(data_to_use, target_spectra, input_values)

    return jsonify({"classNames": input_keys, "data_z": class_results.tolist(), "data_z_original": data_to_use[:,:,0].squeeze().tolist()})



@app.route('/run_algo_usupervised', methods=['GET', 'POST'])
def run_algo_usupervised():
    inputs_dict= json.loads(request.form["inputs"])
    n_clusters = int(inputs_dict["n_clusters"])
    data_to_process_dict= json.loads(request.form["data_to_process"])
    # print(n_clusters)

    global data
    if (data_to_process_dict["data_type"] == "original"):
        data_to_use= data
    elif (data_to_process_dict["data_type"] == "preprocessed"):
        filter_path= get_filter_file(data_to_process_dict["filter"], data_to_process_dict["filterID"])
        data_to_use= np.load(filter_path)


    algo= request.form["algo"]
    class_results= cluster_data_cube(data_to_use, n_clusters)
    return jsonify({"data_z": class_results.tolist()})
    # return "ok"




def sam_algo(hyperspectral_cube, reference_spectra, thresholds):
    # Normalize the data cube
    cube_norm = np.sqrt(np.sum(np.square(hyperspectral_cube), axis=-1))
    hyperspectral_cube_normalized = hyperspectral_cube / cube_norm[..., np.newaxis]

    # Ensure thresholds is a list
    if not isinstance(thresholds, list):
        thresholds = [thresholds] * len(reference_spectra)

    # Initialize a matrix to store the minimum spectral angle for each pixel
    min_angles = np.full(hyperspectral_cube.shape[:2], np.inf)
    classification_results = np.zeros(hyperspectral_cube.shape[:2], dtype=int)

    # Iterate over each reference spectrum and its corresponding threshold
    for mineral_index, (reference_spectrum, threshold) in enumerate(zip(reference_spectra, thresholds), start=1):
        if len(reference_spectrum) != hyperspectral_cube.shape[2]:
            raise ValueError("The number of spectral bands in the data cube and the reference spectrum do not match.")

        # Normalize the reference spectrum
        reference_norm = np.linalg.norm(reference_spectrum)
        reference_normalized = reference_spectrum / reference_norm

        # Calculate the dot product and the spectral angle
        dot_product = np.einsum('ijk,k->ij', hyperspectral_cube_normalized, reference_normalized)
        dot_product = np.clip(dot_product, -1.0, 1.0)  # Clip values for safety
        spectral_angle = np.arccos(dot_product)

        # Update classification results with the mineral having the smallest angle that's below its specific threshold
        better_match = (spectral_angle < min_angles) & (spectral_angle <= threshold)
        classification_results[better_match] = mineral_index
        min_angles[better_match] = spectral_angle[better_match]

    # Set pixels with angles above the smallest threshold to 0 indicating no classification
    classification_results[min_angles > max(thresholds)] = 0

    return classification_results

def classify_max_likelihood(data_cube, target_spectra, thresholds):
    # Flatten the data cube to a 2D array where each row is a pixel
    flattened_data_cube = data_cube.reshape(-1, data_cube.shape[2])

    # Initialize the result matrix with -1 (unclassified)
    results = np.full(flattened_data_cube.shape[0], 0, dtype=int)
    max_log_likelihoods = np.full(flattened_data_cube.shape[0], -np.inf)

    # Compute the log likelihood for each target spectrum
    for target_index, mean_spectrum in enumerate(target_spectra, start=1):
        log_likelihoods = -0.5 * np.sum((flattened_data_cube - mean_spectrum)**2, axis=1)
        likelihood_threshold = np.percentile(log_likelihoods, thresholds[target_index - 1] * 100)

        # Check if this target's likelihood is the highest so far and above the threshold
        is_highest_and_above_threshold = (log_likelihoods > max_log_likelihoods) & (log_likelihoods > likelihood_threshold)
        results[is_highest_and_above_threshold] = target_index
        max_log_likelihoods[is_highest_and_above_threshold] = log_likelihoods[is_highest_and_above_threshold]

    # Reshape results back to the original image dimensions
    classified_image = results.reshape(data_cube.shape[0], data_cube.shape[1])
    return classified_image


def cluster_data_cube(data_cube, n_clusters):
    # Calculate the product of the first two dimensions to confirm it matches the desired reshape
    num_rows = data_cube.shape[0] * data_cube.shape[1]
    # Reshape the data
    reshaped_data = data_cube.reshape(num_rows, data_cube.shape[2])
    # Use the first 9 dimensions for clustering
    X = reshaped_data[:, :9]
    # Perform KMeans clustering
    kmeans = KMeans(n_clusters=n_clusters, init='k-means++', random_state=42)
    y_kmeans = kmeans.fit_predict(X)
    # Reshape the result back to the original dimensions
    new_rows = data_cube.shape[0]
    new_columns = data_cube.shape[1]
    res = y_kmeans.reshape(new_rows, new_columns)
    return res
# class_results = calculate_sam_multiple(data_cube, target_spectra, thresholds)

######################## Minimum Distance #################################
def min_distance_classification(data_cube, target_spectra, thresholds):
    # Initialize classification output to -1 indicating unclassified
    class_output = np.zeros(data_cube.shape[:-1], dtype=int)
    min_distance = np.full(data_cube.shape[:-1], np.inf)

    for class_label, (target_spectrum, threshold) in enumerate(zip(target_spectra, thresholds), start=1):
        # Compute distances from each pixel to the target spectrum
        distances = np.sqrt(np.sum((data_cube - target_spectrum[np.newaxis, np.newaxis, :]) ** 2, axis=-1))

        # Identify pixels that should be classified to this class
        is_classified = (distances < min_distance) & (distances <= threshold)

        # Update classification output and minimum distances for these pixels
        class_output[is_classified] = class_label
        min_distance[is_classified] = distances[is_classified]

    return class_output

def get_line_points(x0, y0, x1, y1):
    dx = abs(x1 - x0)
    dy = abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy

    line = []

    while True:
        line.append((x0, y0))

        if x0 == x1 and y0 == y1:
            break

        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy

    return line

def point_in_polygon(x, y, poly):
    n = len(poly['x'])
    inside = False
    p1x, p1y = round(poly['x'][0]), round(poly['y'][0])
    for i in range(n + 1):
        p2x, p2y = round(poly['x'][i % n]), round(poly['y'][i % n])
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def points_inside_polygon(poly):
    min_x = round(min(poly['x']))
    max_x = round(max(poly['x']))
    min_y = round(min(poly['y']))
    max_y = round(max(poly['y']))
    
    points = []
    for x, y in product(range(int(min_x), int(max_x) + 1), range(int(min_y), int(max_y) + 1)):
        if point_in_polygon(x, y, poly):
            points.append((x, y))
    return points

def remove_correlated_rows(mtx):
    correlation_matrix = np.corrcoef(mtx)
    # print(np.abs(correlation_matrix).min())
    mask = np.abs(correlation_matrix) == 1
    row_indices, _ = np.where(mask)
    row_indices = np.unique(row_indices)
    return np.delete(mtx, row_indices, axis=0)

def min_max_normalize(matrix):
    min_vals = np.min(matrix, axis=1, keepdims=True)
    max_vals = np.max(matrix, axis=1, keepdims=True)
    normalized_matrix = (matrix - min_vals) / (max_vals - min_vals)
    return normalized_matrix



if __name__ == '__main__':
    app.run("0.0.0.0", 5001, debug=True)

