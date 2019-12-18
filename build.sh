#!/bin/bash
trap "kill 0" EXIT

# Set this variable to the name of the output directory
BUILD_DIR=site/public

WATCH=0

# Parsing parameters
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
  -o | --output-dir)
    CUSTOM_BUILD_DIR=$2
    shift # past argument
    shift # past value
    ;;
  -v | --verbose)
    VERBOSE=1
    shift
    ;;
  -w | --watch)
    WATCH=1
    shift
    ;;
  -h | --help)
    echo "Usage : $0 [options]"
    echo
    echo "Options:"
    echo -e "  -o, --output-dir BUILD_DIR\tOutput directory"
    echo -e "  -v, --verbose\t\tVerbose Output!"
    echo -e "  -w, --watch\t\tWatch Mode"
    echo -e "  -h, --help\t\tDisplay this help and exit"
    exit 0
    ;;
  *) # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
  esac
done
echo $POSITIONAL
set -- "${POSITIONAL[@]}" # restore positional parameters

if [[ ! -z "${CUSTOM_BUILD_DIR}" ]]; then
  BUILD_DIR=${CUSTOM_BUILD_DIR}
fi

if [[ "${VERBOSE}" == "1" ]]; then
  echo "Creating build directories"
fi
mkdir -p ${BUILD_DIR}
mkdir -p ${BUILD_DIR}/styles
mkdir -p ${BUILD_DIR}/scripts
mkdir -p ${BUILD_DIR}/resources

if [[ "${VERBOSE}" == "1" ]]; then
  echo "Copying resources and scripts"
fi
cp src/scripts/* ${BUILD_DIR}/scripts/ --update
cp -r src/resources/* ${BUILD_DIR}/resources/ --update
cp src/root/* ${BUILD_DIR}/ --update

if [[ "${VERBOSE}" == "1" && ! -z "${CUSTOM_BUILD_DIR}" && "${WATCH}" == "1" ]]; then
  echo "Updating Less Watch Compiler config"
fi
if [[ ! -z ${CUSTOM_BUILD_DIR} && "${WATCH}" == "1" ]]; then
  change_less_watch_json ${BUILD_DIR}
fi

if [[ "${WATCH}" == "1" ]]; then
  if [[ "${VERBOSE}" == "1" ]]; then
    echo "Compiling pug -> html"
    pug -w src/pug/pages/ --basedir ./ --out ${BUILD_DIR}/ &
  else
    pug -s -w src/pug/pages/ --basedir ./ --out ${BUILD_DIR}/ &
  fi
  if [[ "${VERBOSE}" == "1" ]]; then
    echo "Starting less watch compiler"
  fi
  less-watch-compiler &
  if [[ "${VERBOSE}" == "1" ]]; then
    echo "Starting live server"
    live-server --verbose --port=9600 ./${BUILD_DIR} &
  else
    live-server --port=9600 ./${BUILD_DIR} &
  fi
fi

if [[ "${WATCH}" == "0" ]]; then
  if [[ "${VERBOSE}" == "1" ]]; then
    echo "Compiling pug -> html"
    pug src/pug/pages/ --basedir ./ --out ${BUILD_DIR}/ &
  else
    pug -s src/pug/pages/ --basedir ./ --out ${BUILD_DIR}/ &
  fi
  if [[ "${VERBOSE}" == "1" ]]; then
    echo "Compiling less -> css"
  fi
  lessc ./src/less/index.less ${BUILD_DIR}/styles/index.css
  cleancss --inline all -o ${BUILD_DIR}/styles/index.min.css ${BUILD_DIR}/styles/index.css
  rm ${BUILD_DIR}/styles/index.css
fi
wait

# Function to change directory in less-watch-compiler.config.json
change_less_watch_json() {
  parse_json_script=$(mktemp parse_json.XXXX.py)
  cat > $parse_json_script << SCRIPT
  #!/usr/bin/env python
  import json
  filename = "less-watch-compiler.config.json"
  with open(filename, 'r+') as f:
    jsonObject = json.load(f)
    jsonObject['outputFolder'] = "$1/styles"
    f.seek(0)
    json.dump(jsonObject, f, indent=4, separators=(','," : "))
SCRIPT
  python $parse_json_script && rm $parse_json_script
}
