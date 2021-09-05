# Generate a random file name for each query instance: 
# Maintain an array, select a random index each time, set the corresponding value as new file name;
# then sets null to the particular index in array.
# In each loop, check if the value has been selected by checking whether the value was unset

array=( $(seq 1 10000 ) )

#for template in $(ls); do                       # runs through the 'templates' in this dir   
cd "main/"
for template in *; do                       # runs through the 'templates' in this dir                                                           
  if [ -d $template ]; then                     # if this is a dir
     fname=${template##*/}                      # pick up the dir name
     nums=${fname##*[!-0-9]}                    # pick up the QT number   

     cd $template                               # move into the dir    
     for file in *.graphql; do                  # loop over all queries
       rand=$[$RANDOM % ${#array[@]}]			# pick a random index
       
       while [ -z "${array[$rand]}" ]; do       # if the value has been selected, generate another random index
       	echo "empty"
       	rand=$[$RANDOM % ${#array[@]}]
       done

       echo ${array[$rand]}
       new_file="${array[$rand]}"
       unset array[$rand]						# set null value to the index $rand in array

       if [[ ${#nums} < 2 ]]  ; then			# 2-digit query template number 
        nums="0$nums"
       fi

       # mv -- "$file" "${new_file}${nums}.graphql" # append QT number as the suffix of the file
       cp -- "$file" "../../mixed_main/${new_file}${nums}.graphql"   # move files to the target directory
       
       cp -- "../../Hasura/${template}/${file}" "../../mixed_Hasura/${new_file}${nums}.graphql"
       cp -- "../../PostGraphile/${template}/${file}" "../../mixed_PostGraphile/${new_file}${nums}.graphql"

       echo ${new_file}${nums}
     done                                        
     cd ..                                         
  fi                                              
done