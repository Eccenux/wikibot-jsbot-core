: <<'COMMENT'
Based on:
https://stackoverflow.com/questions/1043388/record-file-copy-operation-with-git/46484848#46484848

Doing this copies a file and blame will work on both files.
Note however that only the `origFile` will get a full history directly.
The `copyName` file will be seen as renamed and will get history only if you enable following renamed files.

COMMENT

origFile=src/NuxJsBot.js
copyName=src/minorSk.js
branchName=duplicate-minorSk

git checkout -b $branchName # create and switch to branch

git mv $origFile $copyName # make the duplicate
git commit -m "duplicate $origFile to $copyName"

git checkout HEAD~ $origFile # bring back the original
git commit -m "restore duplicated $origFile"

git checkout - # switch back to source branch
git merge --no-ff $branchName -m "Merge branch $branchName" # merge dup into source branch